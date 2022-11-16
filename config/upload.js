const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${req.imageID}-${originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      return cb(new Error('Invalid mime type'));
    }
  }
});

module.exports = upload;
