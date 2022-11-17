const exif = require('exif-parser');
const fs = require('fs');

const coordinatesExtractor = (filepath) => {
  const buffer = fs.readFileSync(filepath);
  const parser = exif.create(buffer);
  parser.enableImageSize(false);

  const coordinates = {
    GPSLatitude: undefined,
    GPSLongitude: undefined
  };

  try {
    const { tags: { GPSLatitude, GPSLongitude } } = parser.parse();
    coordinates.GPSLatitude = GPSLatitude;
    coordinates.GPSLongitude = GPSLongitude;
  } catch (error) {
    console.error('Provided image does not have EXIF data.');
  }

  return coordinates;
};

module.exports = coordinatesExtractor;
