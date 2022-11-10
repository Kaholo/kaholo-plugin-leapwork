const { bootstrap } = require("@kaholo/plugin-library");

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

  const runId = await leapworkService.postScheduler(leapworkUrl, accessKey, id, variables);
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

  if (license[0].ExpireDays > 0) {
    return `License expires in ${license[0].ExpireDays} days!`;
  }
  throw new Error("License expired!");
}

async function runCurl(params) {
  const { command } = params;

  const newCommand = `${command} -s`;
  const { stdout: result } = await execCommand(newCommand);

  try {
    return JSON.parse(result.replace(/\$id/g, "id"));
  } catch {
    return result;
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
  console.info(`\nResponse: ${JSON.stringify(result)}\n`);
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
  console.info(`\nResponse: ${JSON.stringify(result)}\n`);
  return result;
}

module.exports = bootstrap({
  runScheduler,
  checkActiveLicense,
  getRunItemIds,
  getRunItems,
  runCurl,
}, autocomplete);
