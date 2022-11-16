const request = require('supertest');
const path = require('path');

const server = require('../server');
const db = require('../config/db');
const { wss } = require('../app');

describe('Testing API', () => {
  const imageStructure = {
    filepath: expect.any(String),
    lon: expect.any(Number),
    lat: expect.any(Number),
    filename: expect.any(String),
    thumbnailPath: expect.any(String)
  };

  const uploadedFilesResponseStructure = {
    message: expect.any(String),
    successful: expect.any(Number),
    unsuccessful: expect.any(Number),
    error: expect.any(String),
    createdIDs: expect.any(Array)
  };

  afterAll(() => {
    server.close();
    wss.close();
    db.end();
  });

  describe('test GET /images route', () => {
    test('get images with provided coordinates', () => {
      return request(server)
        .post('/upload')
        .attach('image', path.join(__dirname, '/test.jpeg'))
        .then((response) => {
          const [createdID] = response.body.createdIDs;
          return request(server).get('/images?minLon=50&maxLon=55&minLat=-5&maxLat=5')
            .expect(200)
            .then((response) => {
              expect(response.body)
                .toEqual(expect.arrayContaining([expect.objectContaining(imageStructure)]));

              return request(server).del(`/${createdID}`);
            });
        });
    });

    test('get images without providing coordinates', () => {
      return request(server)
        .get('/images')
        .expect(404)
        .then((response) => {
          expect(response.text).toBe('Invalid or missing parameters.');
        });
    });
  });

  describe('test POST /upload route', () => {
    test('test route without attaching files', () => {
      return request(server)
        .post('/upload')
        .expect(404)
        .then((response) => {
          expect(response.text).toBe('No files provided.');
        });
    });

    test('test route attaching file with invalid format', () => {
      return request(server)
        .post('/upload')
        .attach('image', path.join(__dirname, '/a.js'))
        .expect(500);
    });

    test('test route with attached img with valid EXIF data', () => {
      return request(server)
        .post('/upload')
        .attach('image', path.join(__dirname, '/test.jpeg'))
        .expect(200)
        .then((response) => {
          const [createdID] = response.body.createdIDs;

          expect(response.body)
            .toEqual(expect.objectContaining(uploadedFilesResponseStructure));

          return request(server).del(`/${createdID}`);
        });
    });
  });

  describe('test DELETE / route', () => {
    test('test route with provided invalid filepath', () => {
      return request(server)
        .del('/a')
        .expect(404)
        .then((response) => {
          expect(response.text).toBe('Could not find image with provided id.');
        });
    });

    test('test route with provided valid filepath', () => {
      return request(server)
        .post('/upload')
        .attach('image', path.join(__dirname, '/test.jpeg'))
        .then((response) => {
          const [createdID] = response.body.createdIDs;

          return request(server)
            .del(`/${createdID}`)
            .expect(200)
            .then((response) => {
              expect(response.body.message).toBe('Image deleted.');
            });
        });
    });
  });
});
