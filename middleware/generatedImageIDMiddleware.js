const uuid = require('uuid').v4;

const generatedImageIDMiddleware = (req, res, next) => {
  req.imageID = uuid();
  next();
};

module.exports = generatedImageIDMiddleware;
