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

	sudo apt update
	sudo apt install build-essential
    sudo apt install mysql-server
    sudo apt install libmysqlclient-dev
    sudo apt install python3-dev


2. Setup MySQL

    mysql -u root

    create database poisson_data;
    show databases;

    create user 'django'@'localhost' identified by 'fish';
	grant usage on *.* to 'django'@'localhost';
	grant all privileges on poisson_data.* to 'django'@'localhost';
    exit

3. Setup Python

    git clone https://github.com/moosev2/poisson.git
    cd poisson
    python3 -m venv env
    source env/bin/activate
    pip install -r requirements.txt

    python manage.py makemigrations backend
    python manage.py migrate

4. Run

   # Using Django
   python manage.py runserver 0.0.0.0:80

   # OR, Gunicorn (seems to be some caching bugs?)
   gunicorn -b 0.0.0.0:80 poisson.wsgi




