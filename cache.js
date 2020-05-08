const CacheHandler = require("./util/classes/CacheHandler");
const { cacheTime } = require("./config");
module.exports = new CacheHandler(cacheTime);