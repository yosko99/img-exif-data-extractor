const fs = require('fs');

const checkIfUploadsFolderExistsMiddleware = (req, res, next) => {
  fs.access('./public/uploads', async (err) => {
    if (err) {
      await fs.mkdirSync('./public/uploads');
    }
  });

  next();
};

module.exports = checkIfUploadsFolderExistsMiddleware;
