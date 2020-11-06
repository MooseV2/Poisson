# Poisson - Share Points of Interest

Poisson is a tool to create and share PoI pages with friends. 

## Stack

Poisson is written using:

- Django
- Django Rest Framework
- MySQL
- Spectre (CSS)
- ES6

## Usage
![Poisson Screenshot](images/screenshot.png?raw=true "Poisson Screenshot")

Upon loading Poisson, you will be presented with a map. If this page has PoIs in the database, you will also see a number of markers on the map.

You can add markers by clicking on the map, and the sidebar will populate with their entries. To edit the text or markers, click the "Edit" button at the top-right corner of the sidebar. You'll be able to edit the text in the "title" or "description" fields, as well as move/delete markers using their respective buttons.

To share a PoI page, simply copy the URL. Each unique URL is its own page, and visitors will see your PoIs. Want a new page? Simply append a number of your choice to the website address (or visit the root page to be assigned a random number).

## Installation

### Requirements:

- Python (3.5, 3.6, 3.7, 3.8, 3.9)
- Django (2.2, 3.0, 3.1)
- Gunicorn
- MySQL server

### Setup steps

1. Dependencies

```sh
sudo apt update
sudo apt install build-essential
sudo apt install mysql-server
sudo apt install libmysqlclient-dev
sudo apt install python3-dev
```

2. Setup MySQL

```sh
mysql -u root
```

```sql
create database poisson_data;
show databases;

create user 'django'@'localhost' identified by 'fish';
grant usage on *.* to 'django'@'localhost';
grant all privileges on poisson_data.* to 'django'@'localhost';
exit
```

3. Setup Python

```sh
git clone https://github.com/moosev2/poisson.git
cd poisson
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt

python manage.py makemigrations backend
python manage.py migrate
```

4. Run

```sh
# Using Django
python manage.py runserver 0.0.0.0:80

# OR, Gunicorn (seems to be some caching bugs?)
gunicorn -b 0.0.0.0:80 poisson.wsgi
```

## Next Steps

### Scalability

Currently this MVP is not designed to be production-ready. Some obvious first steps:

- **From 1 to 100 users**
  - Performance: use a proper reverse proxy (Nginx) to dispatch clients to the Django instance. Also to serve static assets (both Django and Gunicorn are not designed to do this)
  - Security hardening: firewalls, proper key managements, provide only minimal permissions from authenticated services, TLS should be added (Let's Encrypt) to the web server.
  - User features: add login / authentication system, since currently anyone can edit any page. Add a better onboarding experience, and make it easier to share pages (since the goal of this platform is to share the PoIs with others)
  - Codebase: Better documentation is always a good idea, as well as investing in a test suite to cover both the back and frontend
- **From 100-10000 users**
  - Server performance: Add load balancing to dispatch requests into one of many servers. Since 100-10000 is a large range, ideally the servers would automatically scale based on the load. Put static assets on a CDN.
  - Backend performance: Optimize database by evaluating reads/writes, indexes, etc.
  - Frontend performance: Change the number of requests needed to update data (currently 1 POST request per PoI update; this can be batched)
  - Security: It's a good idea to perform penetration testing at this point
- **Beyond 10k users**
  - Most likely the previous changes from the previous step are sufficient to handle many more users. If the server can effectively load balance and autoscale, then the bottlenecks have already been mitigated. Some value-engineering can be done to reduce server costs, but I would manage this on a as-need basis and with a team with experience scaling to huge numbers.



### Features that didn't make the cut (due to time):

- User authentication, so users can create and edit pages without fear of modification from others
- Better map positioning: a crosshair should bring the map to view the users' physical location. Also the map should automatically zoom out to the extents of all the Points of Interest on a page load.
- Autocomplete locations, so users can type a Point of Interest and a marker will be placed there automatically
- Add an (editable) page title, so pages can be labeled ("Favourite Restaurants"). Should be trivial to incorporate into the MVP due to the way it was designed.


## License

MIT license. See [LICENSE](LICENSE "LICENSE") for more details.




