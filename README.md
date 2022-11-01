# Kaholo Leapwork Plugin
This plugin integrates Leapwork with Kaholo, providing access to run any curl commands and a super easy way to run leapwork schedulers and fetch the summary results.

## Prerequisites
- This plugin works with Leapwork version 2022.2.700 or later and Leapwork API version v4.

- Expose the Leapwork controller (default port: 9001) over the internet using [ngrok](https://ngrok.com/) or similar services. E.g. `ngrok http 9001` exposes the LeapworkURL.

- Follow the [Leapwork API access key documentation](https://www.leapwork.com/product/documentation/administration/api-access-keys) to retrieve the Access key.


## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Setup Plugin Account
1. Filter the Leapwork plugin in Settings -> Plugins page, click on Settings icon.
2. Setup LeapworkURL and AccessKey under Accounts -> Add Account.
3. Create a new Pipeline, drag and drop Leapwork Asset into your design tab.
4. Select any Method, Account, parameters and execute.

Required parameters have an asterisk (*) next to their names.

| Parameter | Description |
|---|---|
| Leapwork URL * | URL of Leapwork controller. |
| Access Key *  | API Access key of Leapwork. |
| Timeout | Scheduler Timeout in seconds. Scheduler will be stopped automatically when the timeout is reached. [Default - 100 minutes] |

## Method: Run Scheduler
This method retrieves the available scheduler from Leapwork and executes it. It waits till the scheduler finishes its execution and returns the summary results as a JSON object for further processing.

### Parameters
Required parameters have an asterisk (*) next to their names.
* Select Scheduler * - Select from the list of auto-populated schdulers from Leapwork.
* Variables - Pass in optional variables. (e.g. var1=val1&var2=val2).

## Method: Check Active License
This method gets the [active](https://www.leapwork.com/product/documentation/rest-api/v4/get-active-licenses) Leapwork license and can return the number of days for license expiry by default.

### Parameters
Required parameters have an asterisk (*) next to their names.
* Check Expiry? * (toggle) - Checks if the license is expired

## Method: Run Curl Command
This method runs any leapwork curl command present within the [API](https://www.leapwork.com/product/documentation/rest-api/v4/endpoints) documentation.

### Parameters
Required parameters have an asterisk (*) next to their names.
* Curl Command * - Enter the curl command to run

## Others
If you are interested in adding any more REST API integration from leapwork, please let us know! support@kaholo.io.
