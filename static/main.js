class POIElement {
    constructor(title, description, latlong) {
        this.title = title;
        this.description = description;
        this.latlong = latlong;
        this.marker = new L.marker(latlong, { opacity: 0.5 }).addTo(window.map);
        this.UUID = Date.now();

        const template = document.getElementById("template_poi");

        // appendChild moves our DocumentFragment into the real DOM, and we lose its reference
        const POIMenu = document.getElementById("poi-menu");
        POIMenu.appendChild(document.importNode(template.content, true));
        this.DOMElement = POIMenu.lastElementChild;
        this.updateDOM(); // Update our bare template with this objects content
        this.setEditMode(window.dataSync.editable);

        // Dim the marker when we're not hovering
        this.DOMElement.addEventListener('mouseenter', () => this.marker.setOpacity(1.0));
        this.DOMElement.addEventListener('mouseleave', () => this.marker.setOpacity(0.5));

        // Add controls
        this.DOMElement.querySelector('.control-move').onclick = this.editPOI.bind(this);
        this.DOMElement.querySelector('.control-delete').onclick = this.destructor.bind(this);

        // We can now update our DOM, but we also want the DOM changes to update this object
        const changeWatch = new MutationObserver(this.updateThis.bind(this));
        const config = { childList: true, subtree: true, characterData: true };
        changeWatch.observe(this.DOMElement, config);

        // Finally, tell DataSync that we have a change
        window.dataSync.invalidateSync();
    }

    setEditMode(mode) {
        let setEditable = (selector, value) => this.DOMElement.querySelector(selector).setAttribute("contenteditable", value);
        setEditable(".title", mode);
        setEditable(".description", mode);

        const buttonBar = this.DOMElement.querySelector(".button-bar");
        if (mode) {
            buttonBar.classList.add("visible");
        } else {
            buttonBar.classList.remove("visible");
        }
    }

    editPOI() {
        window.map.editPOI = this;
        window.toast("Click on the map to move the POI marker")
    }

    updateDOM() {
        let updateText = (selector, text) => this.DOMElement.querySelector(selector).textContent = text;
        updateText(".title", this.title);
        updateText(".description", this.description);
    }

    updateMarker(latlong) {
        this.latlong = latlong;
        window.map.removeControl(this.marker)
        this.marker = new L.marker(latlong, { opacity: 0.5 }).addTo(window.map);
        window.dataSync.invalidateSync();
    }

    updateThis() {
        const getText = (selector) => this.DOMElement.querySelector(selector).textContent;
        [this.title, this.description] = [getText(".title"), getText(".description")];
        window.dataSync.invalidateSync();
    }

    serialize() {
        return {
            "uuid": this.UUID,
            "page": window.dataSync.currentPage,
            "title": this.title,
            "description": this.description,
            "latitude": parseFloat(this.latlong.lat).toFixed(6),
            "longitude": parseFloat(this.latlong.lng).toFixed(6)
        }
    }

    destructor() {
        // NOTE: ES6 doesn't automatically call the destructor, remember to call it
        document.getElementById("poi-menu").removeChild(this.DOMElement);
        window.map.removeControl(this.marker);
        window.dataSync.removePOI(this.UUID);
        window.dataSync.invalidateSync();
    }
}

class DataSync {
    // This class handles syncronizing the data to the server
    constructor() {
        this.POIElements = {};
        this.syncedElements = {};
        this.editable = false;
        this.syncTimer = null;
        this.currentPage = this.getCurrentPage();
        this.csrf = document.querySelector("input[name=csrfmiddlewaretoken]").value;

        document.getElementById("edit").onclick = this.toggleEditMode.bind(this);
    }

    getCurrentPage() {
        const pageId = window.location.pathname.match(/\d+/)[0];
        if (pageId === undefined) return 0;
        return pageId;
    }


    invalidateSync() {
        // This method will start or reset a 2 second timer.
        // When this timer expires, the data syncs. This prevents
        // too many requests while the user is editing something
        if (this.syncTimer != null) {
            clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(this.syncData.bind(this), 2000);
    }

    syncData() {
        // Deleted rows
        for (const [key, object] of Object.entries(this.syncedElements)) {
            if (this.POIElements[key] === undefined) {
                this.removeDBRow(key, object);
            }
        }

        // New changes
        for (const [key, object] of Object.entries(this.POIElements)) {
            let syncData = false;
            // First, we check if this object has been synced
            if (JSON.stringify(this.syncedElements[key]) !== JSON.stringify(object.serialize())) {
                // Since the synced version doesn't equal the new version, we'll sync
                this.updateDBRow(key, object);
            }
        }
    }

    updateDBRow(key, object) {
        fetch(`/api/PointOfInterest/${key}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrf
            },
            body: `{"PoI": ${JSON.stringify(object.serialize())}}`,
        }).then(resp => {
            console.info(resp);
            this.syncedElements[key] = object.serialize();
        }).catch(e => {
            console.log("Fetch error :$", e)
        })

    }

    removeDBRow(key) {
        fetch(`/api/PointOfInterest/${key}`, {
            method: "DELETE",
            headers: {
                'X-CSRFToken': this.csrf
            }
        }).then(resp => {
            console.info(resp);
        }).catch(e => {
            console.log("Fetch error :$", e)
        })
        delete this.syncedElements[key];
    }

    removePOI(UUID) {
        delete this.POIElements[UUID];
    }

    addPOI(title, description, latlong) {
        this.addPOIWithUUID(title, description, latlong, null);
    }

    addPOIWithUUID(title, description, latlong, uuid) {
        let POIE = new POIElement(title, description, latlong);
        if (uuid !== null) {
            POIE.UUID = uuid;
        }
        this.POIElements[POIE.UUID] = POIE;

    }


    loadJSON() {
        fetch(`/api/PointOfInterest/${this.currentPage}?format=json`, { headers: { 'X-CSRFToken': this.csrf } })
            .then(resp => {
                if (resp.status !== 200) {
                    window.toast(`Looks like there was a problem. Status Code: ${response.status}`);
                    return;
                }
                resp.json().then(json => {
                    json["PointsOfInterest"].forEach((point) => {
                        this.addPOIWithUUID(point.title, point.description, { lat: point.latitude, lng: point.longitude }, point.uuid)
                    });
                })
            })
            .catch(e => {
                console.log("Fetch error :$", e)
            })
    }

    toggleEditMode() {
        this.editable = !this.editable;
        for (const [key, object] of Object.entries(this.POIElements)) {
            object.setEditMode(this.editable);
        }
    }

}

// Create map object
window.map = L.map('mapid').setView([43.4643, -80.5204], 13);
window.map.editPOI = null;
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibW9vc2V2MiIsImEiOiJja2g1NWp2enYwaXphMnBxanVtdnA4ZXFjIn0.b_7IKz9ndKZWDlINX0tb_g'
}).addTo(window.map);

// Add click listener to map, which decides if a new click should create a marker or edit one
window.map.on('click', (e) => {
    if (window.map.editPOI) {
        // Update POI
        window.map.editPOI.updateMarker(e.latlng);
        window.map.editPOI = null;
    } else {
        // Create new POI
        window.dataSync.addPOI("New POI", "Add a description", e.latlng);
    }
});

// Create global DataSync object
window.dataSync = new DataSync();
window.dataSync.loadJSON();
document.onload = window.dataSync.loadJSON;


// Utility
window.toast = (text) => {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3500);
}