const { bootstrap } = require("@kaholo/plugin-library");
const { runScheduler, checkActiveLicense, runCurl,  getRunItemIds, getRunItems } = require("./leapwork-api");
const autocomplete = require("./autocomplete");

module.exports = bootstrap({
  runScheduler,
  checkActiveLicense,
  getRunItemIds,
  getRunItems,
  runCurl
}, {
  ...autocomplete,
});
