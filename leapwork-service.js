const axios = require("axios");

const { delay } = require("./helpers");

const DEFAULT_DELAY_TIME = 1000;
const DEFAULT_MAX_TIMEOUT = 10;

// https://www.leapwork.com/product/documentation/rest-api/v4/get-active-licenses
async function getActiveLicense(leapworkUrl, accessKey) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/license/active?api_key=${accessKey}`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));

  const { data } = await axios(config).catch(handleLeapworkApiError);
  const [license] = filterOutValuesWithId(data);
  return license;
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
  return filterOutValuesWithId(data);
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-schedule-run-status
async function waitForSchedulerToEnd(params, passedMaxCallsNumber) {
  const {
    leapworkUrl,
    accessKey,
    id,
    timeout,
  } = params;

  // (timeout (in seconds) * 1000) / delay time (in miliseconds) = number of max recursive calls
  const maxCallsNumber = passedMaxCallsNumber ?? (
    ((timeout ?? DEFAULT_MAX_TIMEOUT) * 1000) / DEFAULT_DELAY_TIME
  );

  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/schedules/${id}/status`,
    accessKey,
  });

  const { data: statusData } = await axios(config).catch(handleLeapworkApiError);
  console.warn(`#${maxCallsNumber}`, statusData.Status);

  if (statusData.Status === "Finished") {
    return statusData;
  }

  if (maxCallsNumber <= 0) {
    const status = await stopScheduler(leapworkUrl, accessKey, id);
    throw new Error(`Scheduler timed out! Scheduler stopped status true/false: ${status}`);
  }

  await delay(DEFAULT_DELAY_TIME);
  return waitForSchedulerToEnd(params, maxCallsNumber - 1);
}

// https://www.leapwork.com/product/documentation/rest-api/v4/run-schedule-now
async function postScheduler(leapworkUrl, accessKey, id, varsObj) {
  // new URLSearchParams(obj).toString();
  const varsUrlParams = new URLSearchParams(varsObj);
  const config = generateApiRequestConfig({
    method: "put",
    url: `${leapworkUrl}/api/v4/schedules/${id}/runNow?${varsUrlParams}`,
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

async function getItemIds(leapworkUrl, accessKey, runId) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/run/${runId}/runItemIds`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutValuesWithId(data);
}

async function getItems(leapworkUrl, accessKey, id) {
  const config = generateApiRequestConfig({
    url: `${leapworkUrl}/api/v4/runItems/${id}`,
    accessKey,
  });

  console.info(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"));

  const { data } = await axios(config).catch(handleLeapworkApiError);
  return filterOutValuesWithId(data);
}

async function groupItems(leapworkUrl, accessKey, runItemIds) {
  return Promise.all(
    Object.values(runItemIds).map((id) => getItems(leapworkUrl, accessKey, id)),
  );
}

function filterOutValuesWithId(data) {
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
