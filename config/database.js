const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USERNAME;
const password = process.env.MYSQL_PASSWORD;
const timezone = process.env.MYSQL_TIMEZONE;
const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const dialect = 'mysql';
const pool = {
  acquire: 300000,
  max: 50,
  min: 0,
  idle: 10000,
  evict: 10000
};
const sequelize = new Sequelize({ database, host, port, dialect, username, password, timezone, pool, benchmark: true });

module.exports = sequelize;