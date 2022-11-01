const { bootstrap } = require("@kaholo/plugin-library");
const { runScheduler, checkActiveLicense, runCurl } = require("./leapwork-api");
const autocomplete = require("./autocomplete");

module.exports = bootstrap({
  runScheduler,
  checkActiveLicense,
  runCurl
}, {
  ...autocomplete,
});
