# LightBnB

LightBnB is a simple web app focused on database connection. Tech stack involved include Express and Postgress SQL.

## Table of Content
- [Get Started](#get-started)
- [Features](#features)
- [Project ERD](#project-erd)
- [Sample Pages](#sample-pages)
- [Dependencies](#dependencies)

## Features
- Database connection powered by Postgres SQL
- Parameterized query construction to prevent SQL injection security risk
- Multi-parameter search for listings
- Simple login, logout with hashed passwords and cookie session

## Get Started
Before starting, download and install Node.js and Postgres SQL, if you don't have them installed already. Then run the following command in your terminal:

Install dependencies:  
```
$ npm install
```

Create database schema and insert seed data:
```
$ psql
$ \i db/migrations/01_schema.sql
$ \c lightbnb
$ \i db/migrations/seeds/02_seeds.sql
$ \q
```

Create `.env` at the root directory and add the following environment variables
```
PGUSER = "yourusername"
PG_HOST = "localhost"
PG_DATABASE = "lightbnb"
PG_PASSWORD = "yourpassword"
PG_PORT: 5432
```

Start the server  
```
$ npm start
```
Vist the website at http://localhost:3000 in your browser

## Project ERD
![ERD](/docs/erd.png)

## Sample Pages
### Home Page
![home](/docs/home.png)
### Create New Listing
![new listing](/docs/new_listing.png)
### Multi-Parameter Search
![search](/docs/search.png)

## Dependencies
- Express
- node-postgres
- bcrypt
- body-parser
- cookie-session
- dotenv