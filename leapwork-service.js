const { default: axios } = require("axios");

const { delay } = require("./helpers");

// https://www.leapwork.com/product/documentation/rest-api/v4/get-active-licenses
async function getActiveLicense(leapworkUrl, accessKey) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/license/active?api_key=${accessKey}`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));
  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutIdKeys(data);
}

// https://www.leapwork.com/product/documentation/rest-api/v4/stop-schedule-by-schedule-id
async function stopScheduler(leapworkUrl, accessKey, id) {
  const config = generateApiRequestConfig({
    method: "put",
    url: `${leapworkUrl}/api/v4/schedules/${id}/stop`,
    accessKey,
  });

  const res = await axios(config).catch(handleLeapworkApiError);
  return res.data.OperationCompleted.toString();
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-run-by-id
async function getSchedulerResult(leapworkUrl, accessKey, runId) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/run/${runId}`,
    accessKey,
    additionalConfig: {
      json: true,
    },
  });

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutIdKeys(data);
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-schedule-run-status
async function waitForSchedulerToEnd(leapworkUrl, accessKey, id, timeout) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/schedules/${id}/status`,
    accessKey,
  });

  const MAX = (parseInt(timeout, 10) || 10) / 2;
  let tried = 0;
  let res;
  // TODO: refactor this loop to recursive function
  do {
    /* eslint-disable no-await-in-loop, no-plusplus */
    res = await axios(config).catch(handleLeapworkApiError);
    console.warn("#", tried++, res.data.Status);
    await delay(5000);

    if (tried === MAX) {
      const status = await stopScheduler(leapworkUrl, accessKey, id);
      throw new Error(`Scheduler timed out! Scheduler stopped status true/false: ${status}`);
    }
    /* eslint-enable */
  } while (res.data.Status !== "Finished" && tried < MAX);
}

// https://www.leapwork.com/product/documentation/rest-api/v4/run-schedule-now
async function postScheduler(leapworkUrl, accessKey, id, variables) {
  const config = generateApiRequestConfig({
    method: "put",
    url: `${leapworkUrl}/api/v4/schedules/${id}/runNow?${variables}`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));
  const { data } = await axios(config).catch(handleLeapworkApiError);
  return data.RunId;
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-all-schedules
async function getSchedulers(leapworkUrl, accessKey) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/schedules?api_key=${accessKey}`,
    accessKey,
  });

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return data;
}

async function getItemIds(leapworkURL, accessKey, runId) {
  const config = generateApiRequestConfig({
    url: `${leapworkURL}/api/v4/run/${runId}/runItemIds`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutIdKeys(data);
}

async function getItems(leapworkUrl, accessKey, id) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/runItems/${id}`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutIdKeys(data);
}

async function groupItems(leapworkUrl, accessKey, runItemIds) {
  return Promise.all(
    Object.keys(runItemIds).map((id) => getItems(leapworkUrl, accessKey, id)),
  );
}

function filterOutIdKeys(data) {
  return JSON.parse(JSON.stringify(data), (k, v) => (k === "$id" ? undefined : v));
}

function handleLeapworkApiError(error) {
  if (error.response.data) {
    throw new Error(error.response.data);
  }
  if (error.response.status) {
    throw new Error(`Status Code: ${error.response.status}, Scheduler Error: ${error.response.statusText}`);
  }
  throw error;
}

function validateLeapworkUrl(leapworkUrl) {
  if (!leapworkUrl.startsWith("http")) {
    throw new Error("Please specify the full url of Leapwork starting from http:// or https://");
  }
}

function generateApiRequestConfig(params) {
  const {
    method = "get",
    url,
    accessKey,
    additionalConfig = {},
  } = params;

  return ({
    ...additionalConfig,
    method,
    url,
    headers: {
      Accept: "application/json",
      AccessKey: accessKey,
    },
  });
}

module.exports = {
  getSchedulers,
  getActiveLicense,
  validateLeapworkUrl,
  postScheduler,
  waitForSchedulerToEnd,
  getSchedulerResult,
  groupItems,
  getItemIds,
};
