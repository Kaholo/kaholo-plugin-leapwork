const axios = require("axios");
const { postScheduler, waitForSchedulerToEnd, getSchedulerResult, getActiveLicense, execCommand, getItemIds, groupItems } = require("./helpers");

async function runScheduler(params) {
  const {
    leapworkURL,
    accessKey,
    id,
    timeout,
    variables,
  } = params;

  if (!leapworkURL.startsWith("http")) {
    throw new Error("Please specify the full url of Leapwork starting from http:// or https://");
  }
  if (!accessKey) {
    throw new Error("No Access Key was provided. Please provide a access key by following: https://www.leapwork.com/product/documentation/administration/api-access-keys.");
  }

  const runId = await postScheduler(leapworkURL, accessKey, id, typeof variables !== "undefined" ? variables : "");
  await waitForSchedulerToEnd(leapworkURL, accessKey, id, timeout);
  const result = await getSchedulerResult(leapworkURL, accessKey, runId);
  return result;
}

async function checkActiveLicense(params) {
  const {
    leapworkURL,
    accessKey,
    checkExpiry
  } = params;

  if (!leapworkURL.startsWith("http")) {
    throw new Error("Please specify the full url of Leapwork starting from http:// or https://");
  }
  if (!accessKey) {
    throw new Error("No Access Key was provided. Please provide a access key by following: https://www.leapwork.com/product/documentation/administration/api-access-keys.");
  }
  const license = await getActiveLicense(leapworkURL, accessKey);
  console.log(`\nResponse: ${JSON.stringify(license)}\n`);

  if (checkExpiry) {
    if (license[0].ExpireDays > 0) {
      return `License expires in ${license[0].ExpireDays} days!`;
    } else {
      throw new Error(`License expired!`);
    }
  } else {
    return license;
  }
}

async function getRunItemIds(params) {
  const {
    leapworkURL,
    accessKey,
    runId
  } = params;

  if (!leapworkURL.startsWith("http")) {
    throw new Error("Please specify the full url of Leapwork starting from http:// or https://");
  }
  if (!accessKey) {
    throw new Error("No Access Key was provided. Please provide a access key by following: https://www.leapwork.com/product/documentation/administration/api-access-keys.");
  }
  const result = await getItemIds(leapworkURL, accessKey, runId);
  console.log(`\nResponse: ${JSON.stringify(result)}\n`);
  return result;
}

async function getRunItems(params) {
  const {
    leapworkURL,
    accessKey,
    runItemId
  } = params;

  if (!leapworkURL.startsWith("http")) {
    throw new Error("Please specify the full url of Leapwork starting from http:// or https://");
  }
  if (!accessKey) {
    throw new Error("No Access Key was provided. Please provide a access key by following: https://www.leapwork.com/product/documentation/administration/api-access-keys.");
  }
  const result = await groupItems(leapworkURL, accessKey, runItemId);
  console.log(`\nResponse: ${JSON.stringify(result)}\n`);
  return result;
}

async function runCurl(params) {
  const { command } = params;
  const newCommand = `${command} -s`;
  let result = await execCommand(newCommand);
  try {
    return await JSON.parse(result.replace(/\$id/g, 'id'));
  } catch (e) {
    return result;
  }
}

module.exports = {
  runScheduler,
  checkActiveLicense,
  getRunItemIds,
  getRunItems,
  runCurl
};
