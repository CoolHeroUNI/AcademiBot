const CacheHandler = require("../model/Classes/CacheHandler");
const cacheTime = parseInt(process.env.MYSQL_CACHE_TIME) * 1000;

module.exports = new CacheHandler(cacheTime);