const express = require('express');
const exiftool = require('exiftool-vendored').exiftool;

const cors = require('cors');
const WebSocket = require('ws');

const checkIfUploadsFolderExistsMiddleware = require('./middleware/checkIfUploadsFolderExistsMiddleware');
const generatedImageIDMiddleware = require('./middleware/generatedImageIDMiddleware');
const isFileProvidedMiddleware = require('./middleware/isFileProvidedMiddleware');

const coordinatesExtractor = require('./functions/coordinatesExtractor');
const deleteImage = require('./functions/deleteImage');

const upload = require('./config/upload');
const db = require('./config/db.js');

require('dotenv').config();

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

app.use(express.static('public'));
app.use(cors());

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.broadcast(message);
  });
});

wss.broadcast = (msg) => {
  wss.clients.forEach((client) => {
    client.send(msg);
  });
};

app.post(
  '/upload',
  checkIfUploadsFolderExistsMiddleware,
  generatedImageIDMiddleware,
  upload.array('image'),
  isFileProvidedMiddleware,
  async (req, res) => {
    const files = req.files;

    const response = {
      message: '',
      successful: 0,
      unsuccessful: 0,
      error: '',
      createdIDs: []
    };

    await Promise.all(files.map(async (file) => {
      const filepath = `${req.imageID}-${file.originalname}`;

      const { GPSLatitude, GPSLongitude } = coordinatesExtractor(file.path);

      if (GPSLatitude !== undefined) {
        exiftool.extractPreview(file.path, `public/uploads/thumbnail-${file.filename}`);

        const lat = GPSLatitude;
        const lon = GPSLongitude;

        db.query(
          `INSERT INTO Image VALUES ("${filepath}",
                    ${lat},
                    ${lon},
                    "${file.originalname}",
                    "thumbnail-${filepath}")`
        );

        response.createdIDs[response.successful++] = filepath;
        response.message = `Successfully imported images: ${response.successful}`;
      } else {
        response.unsuccessful++;
        response.error = `No GPS Data in provided image. Unsuccessfully imported images ${response.unsuccessful}`;

        await deleteImage(filepath);
      }
    }));

    res.json(response);
  });

app.delete('/:id', async (req, res) => {
  const filepath = req.params.id;

  db.query(`DELETE FROM Image WHERE filepath = "${filepath}"`, async (err, result) => {
    if (err) {
      return res.status(404).json({
        err
      });
    }

    const didDelete = result.affectedRows !== 0;

    if (didDelete) {
      await deleteImage(filepath);
      await deleteImage(`thumbnail-${filepath}`);

      return res.status(200).json({
        message: 'Image deleted.'
      });
    }

    return res.status(404).send('Could not find image with provided id.');
  });
});

app.get('/images', async (req, res) => {
  const { minLon, maxLon, minLat, maxLat } = req.query;

  await db.query(`SELECT * FROM Image WHERE lon BETWEEN ${minLon} AND ${maxLon} AND lat BETWEEN ${minLat} AND ${maxLat}`, (err, result) => {
    if (err) {
      return res.status(404).send('Invalid or missing parameters.');
    }
    return res.status(200).json((result));
  });
});

module.exports = {
  app,
  wss
};
