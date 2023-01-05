const { bootstrap, parsers } = require("@kaholo/plugin-library");
const leapworkService = require("./leapwork-service");
const autocomplete = require("./autocomplete");
const { execCommand } = require("./helpers");

async function runScheduler(params) {
  const {
    leapworkUrl,
    accessKey,
    id,
    timeout,
    variables,
  } = params;

  leapworkService.validateLeapworkUrl(leapworkUrl);

  const varsObj = variables ? parsers.keyValuePairs(variables) : {};

  const runId = await leapworkService.postScheduler(leapworkUrl, accessKey, id, varsObj);
  await leapworkService.waitForSchedulerToEnd({
    leapworkUrl,
    accessKey,
    id,
    timeout,
  });
  return leapworkService.getSchedulerResult(leapworkUrl, accessKey, runId);
}

async function checkActiveLicense(params) {
  const {
    leapworkUrl,
    accessKey,
    checkExpiry,
  } = params;

  leapworkService.validateLeapworkUrl(leapworkUrl);

  const license = await leapworkService.getActiveLicense(leapworkUrl, accessKey);
  console.info(`\nResponse: ${JSON.stringify(license)}\n`);

  if (!checkExpiry) {
    return license;
  }

  if (license.ExpireDays > 0) {
    return `License expires in ${license.ExpireDays} days!`;
  }
  throw new Error("License expired!");
}

async function runCurl(params) {
  const { command } = params;

  const newCommand = `${command} -s`;
  const result = await execCommand(newCommand);
  if(result.stdout=="" && result.stderr=="") {
    console.error("Curl command succeeded but nothing was returned - possibly a typo in the URL's path?");
    return;
  }
  try {
    return JSON.parse(result.stdout.replace(/\$id/g, "id"));
  } catch {
    if (result.stderr) {
      console.error(result.stderr);
    }
    return result.stdout;
  }
}

async function getRunItemIds(params) {
  const {
    leapworkUrl,
    accessKey,
    runId,
  } = params;

  leapworkService.validateLeapworkUrl(leapworkUrl);

  const result = await leapworkService.getItemIds(leapworkUrl, accessKey, runId);
  return result;
}

async function getRunItems(params) {
  const {
    leapworkUrl,
    accessKey,
    runItemId,
  } = params;

  leapworkService.validateLeapworkUrl(leapworkUrl);

  const result = await leapworkService.groupItems(leapworkUrl, accessKey, runItemId);
  return result;
}

module.exports = bootstrap({
  runScheduler,
  checkActiveLicense,
  getRunItemIds,
  getRunItems,
  runCurl,
}, autocomplete);
