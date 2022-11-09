const axios = require("axios");
const childProcess = require("child_process");

async function getKeyByValue(object, value) {
    return Object.values(object).find(items => Object.keys(items).find(key => items[key] === value)).id;
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-all-schedules
async function getSchedulers(leapworkURL, accessKey) {
    var config = {
        method: 'get',
        url: `${leapworkURL}/api/v4/schedules?api_key=${accessKey}`,
        headers: {
            'Accept': 'application/json',
            'AccessKey': accessKey
        }
    };

    try {
        let res = await axios(config);
        let data = res.data;
        var schedulers = [];
        Object.keys(data).forEach(function (index) {
            if (data[index].Title)
                schedulers.push({ id: data[index].Id, value: data[index].Title })
        });
        return schedulers;
    } catch (error) {
        throw new Error(error.message);
    }
}


// https://www.leapwork.com/product/documentation/rest-api/v4/run-schedule-now
async function postScheduler(leapworkURL, accessKey, id, variables) {
    const config = {
        method: "put",
        url: `${leapworkURL}/api/v4/schedules/${id}/runNow?${variables}`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };

    try {
        console.log(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"))
        const res = await axios(config);
        return res.data.RunId;
    } catch (error) {
        if (error.response.data) {
            throw new Error(error.response.data);
        }
        if (error.response.status) {
            throw new Error(`Status Code: ${error.response.status}, Scheduler Error: ${error.response.statusText}`);
        }
    }
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-schedule-run-status
async function waitForSchedulerToEnd(leapworkURL, accessKey, id, timeout) {
    const config = {
        method: "get",
        url: `${leapworkURL}/api/v4/schedules/${id}/status`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };
    const MAX = (parseInt(timeout) || 10) / 2;
    let tried = 0;
    let res;
    do {
        try {
            res = await axios(config);
            console.warn("#", tried++, res.data.Status);
            await delay(5000);
        } catch (error) {
            throw new Error(error.message);
        }
        if (tried === MAX) {
            stopScheduler(leapworkURL, accessKey, id).then((status) => {
                throw new Error(`Scheduler timed out! Scheduler stopped status true/false: ${status}`);
            });
        }
    } while (res.data.Status !== "Finished" && tried < MAX);
}

async function delay(milisec = 600000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("resolved");
        }, milisec);
    });
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-run-by-id
async function getSchedulerResult(leapworkURL, accessKey, runId) {
    const config = {
        method: "get",
        url: `${leapworkURL}/api/v4/run/${runId}`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
        json: true
    };

    try {
        const { data } = await axios(config);
        var filteredData = filterId(data);
        return filteredData;
    } catch (error) {
        throw new Error(error.message);
    }
}

function filterId(data) {
    return JSON.parse(JSON.stringify(data), function (k, v) {
        return k === '$id' ? undefined : v;
    });
}

// https://www.leapwork.com/product/documentation/rest-api/v4/stop-schedule-by-schedule-id
async function stopScheduler(leapworkURL, accessKey, id) {
    const config = {
        method: "put",
        url: `${leapworkURL}/api/v4/schedules/${id}/stop`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };

    try {
        const res = await axios(config);
        return res.data.OperationCompleted.toString();
    } catch (error) {
        if (error.response.status) {
            throw new Error(`Status Code: ${error.response.status}, Scheduler Error: ${error.response.statusText}`);
        }
        if (error.message) {
            throw new Error(error.message);
        }
    }
}

// https://www.leapwork.com/product/documentation/rest-api/v4/get-active-licenses
async function getActiveLicense(leapworkURL, accessKey) {
    const config = {
        method: "get",
        url: `${leapworkURL}/api/v4/license/active?api_key=${accessKey}`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };

    try {
        console.log(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"))
        const { data } = await axios(config);
        var filteredData = filterId(data);
        return filteredData;
    } catch (error) {
        if (error.response.status) {
            throw new Error(`Status Code: ${error.response.status}, License Error: ${error.response.statusText}`);
        }
        if (error.message) {
            throw new Error(error.message);
        }
    }
}

async function getItemIds(leapworkURL, accessKey, runId) {
    const config = {
        method: "get",
        url: `${leapworkURL}/api/v4/run/${runId}/runItemIds`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };

    try {
        console.log(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"))
        const { data } = await axios(config);
        var filteredData = filterId(data);
        return filteredData;
    } catch (error) {
        if (error.response.status) {
            throw new Error(`Status Code: ${error.response.status}, Run Error: ${error.response.statusText}`);
        }
        if (error.message) {
            throw new Error(error.message);
        }
    }
}

async function getItems(leapworkURL, accessKey, id) {
    const config = {
        method: "get",
        url: `${leapworkURL}/api/v4/runItems/${id}`,
        headers: {
            Accept: "application/json",
            AccessKey: accessKey,
        },
    };

    try {
        console.log(JSON.stringify(config).replaceAll(accessKey, "HIDDEN"))
        const { data } = await axios(config);
        var filteredData = filterId(data);
        return filteredData;
    } catch (error) {
        if (error.response.status) {
            throw new Error(`Status Code: ${error.response.status}, Run Error: ${error.response.statusText}`);
        }
        if (error.message) {
            throw new Error(error.message);
        }
    }
}

async function groupItems(leapworkURL, accessKey, runItemId) {
    const array = [];
    for (const id of runItemId) {
        result = await getItems(leapworkURL, accessKey, id)
        array.push(result);
    }
    return array;
}

async function execCommand(command) {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(stdout);
                return reject(error);
            }

            let newStdout = stdout;
            if (stderr && !stdout) {
                newStdout = `${stderr}\nSuccess!`;
            }
            return resolve(newStdout);
        });
    });
}

module.exports = {
    getKeyByValue,
    getSchedulers,
    postScheduler,
    waitForSchedulerToEnd,
    getSchedulerResult,
    getActiveLicense,
    execCommand,
    filterId,
    getItemIds,
    groupItems
};