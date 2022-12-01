# Image exif data system

Task of project </br>
- Allows clients to upload / delete JPEG images through a REST API
- Can be queried to return all images inside a geographical bounding box, that is defined by min and max latitude/longitude.
- Can be queried to return the original image and thumbnail (256x256) version of it.

## Used tools

Database - ``SQL`` </br>
Backend - ``Express``

## Instructions

```npm install```

After packages are installed, make sure your SQL server is running. </br>  </br>
Populate .env file with your info. And run ``npm run seeder``. This command will create table in your SQL database needed for running this project. </br>

And finally run ``npm run dev`` to start the server.

