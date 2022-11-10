const leapworkService = require("./leapwork-service");

async function listSchedulers(query, params) {
  const {
    leapworkUrl,
    accessKey,
  } = params;

  const schedulersData = await leapworkService.getSchedulers(leapworkUrl, accessKey);

  const schedulers = Object
    .values(schedulersData)
    .filter((scheduler) => scheduler.Title)
    .map(({ Id, Title }) => ({ id: Id, value: Title }));

  return filterAutocompleteItemsByQuery(schedulers, query);
}

function filterAutocompleteItemsByQuery(autocompleteItems, query) {
  if (!query) {
    return autocompleteItems;
  }

  const lowerCaseQuery = query.toLowerCase();

  return autocompleteItems.filter(({ value, id }) => (
    value.toLowerCase().includes(lowerCaseQuery)
    || id.toLowerCase().includes(lowerCaseQuery)
  ));
}

module.exports = {
  listSchedulers,
};
