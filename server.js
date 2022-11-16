const { app } = require('./app');

const PORT = process.env.PORT || 5000;

if (process.env.DB_DATABASE === undefined) {
  console.log('DB not set!');
} else {
  var server = app.listen(PORT);
}

module.exports = server;
