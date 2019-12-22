const { Sequelize } = require('sequelize');

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USERNAME;
const password = process.env.MYSQL_PASSWORD;
const timezone = process.env.MYSQL_TIMEZONE;
const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const dialect = 'mysql';
const pool = {
  acquire: 30000,
  max: 15,
  min: 1,
  idle: 10000,
  evict: 10000
};
const sequelize = new Sequelize({ database, host, port, dialect, username, password, timezone, pool });

module.exports = sequelize;