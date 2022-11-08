const { getSchedulers } = require("./leapwork-service");

async function listSchedulers(query, params) {
  const {
    leapworkUrl,
    accessKey,
  } = params;

  const schedulersData = getSchedulers(leapworkUrl, accessKey);

  const schedulers = Object
    .values(schedulersData)
    .filter((scheduler) => scheduler.Title)
    .map(({ Id, Title }) => ({ id: Id, value: Title }));
  return schedulers;
}

module.exports = {
  listSchedulers,
};
