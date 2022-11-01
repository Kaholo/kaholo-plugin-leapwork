const { getSchedulers } = require("./helpers");

async function listSchedulers(query, params) {
    const schedulers = await getSchedulers(params.leapworkURL, params.accessKey);
    return schedulers;
}

module.exports = {
    listSchedulers,
};