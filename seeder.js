const db = require('./config/db');

db.query(`CREATE TABLE Image (
    filepath mediumtext NOT NULL,
    lon float NOT NULL,
    lat float NOT NULL,
    filename varchar(535) NOT NULL,
    thumbnailPath varchar(535) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `, (err) => {
  if (err) {
    console.log(err);
  }
  process.exit(1);
});
