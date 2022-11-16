const isFileProvidedMiddleware = (req, res, next) => {
  if (req.files === undefined) {
    return res.status(404).send('No files provided.');
  }

  next();
};

module.exports = isFileProvidedMiddleware;
