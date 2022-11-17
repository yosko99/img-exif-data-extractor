const fsPromises = require('fs/promises');

const deleteImage = async (filePath) => {
  try {
    await fsPromises.unlink('./public/uploads/' + filePath);
  } catch (err) {
    console.log(err);
  }
};

module.exports = deleteImage;
