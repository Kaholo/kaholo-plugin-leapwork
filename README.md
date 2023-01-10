# Kaholo Leapwork Plugin
Leapwork is end-to-end test automation that’s faster, easier, and scales across your entire team and tech stack - from Salesforce to SAP and Mainframe. This plugin extends Kaholo to interact with Leapwork. There are methods to run Leapwork Schedules and retreive Run Items. There is also a generic curl method to invoke [Leapwork REST API](https://www.leapwork.com/product/documentation/rest-api) calls that are not specifically covered by a method of this plugin.

## Prerequisites

- This plugin uses Leapwork API version v4. The Leapwork controller must support v4. Only the generic curl method may be used with other methods.

- The Leapwork controller with exposed Leapwork REST API must be reachable by the Kaholo Agent. By default the controller listens on port 9001 for HTTP API requests.

- A correct Leapwork API key is required. Follow the [Leapwork API access key documentation](https://www.leapwork.com/product/documentation/administration/api-access-keys) to obtain a working Access key, or request one from your Leapwork administrator.

Use the [Kaholo Command Line plugin](https://github.com/Kaholo/kaholo-plugin-cmd) with command `nc` if necessary to establish a URL that can be used to invoke the Leapwork API. For example:

    nc -zv 10.60.27.38 9001           or,
    nc -zv winsvrlwc.mynet.org 9001

If the Leapwork API is reachable and listening at that host/IP and port the result will be "open". Otherwise it will time out after a couple minutes of trying.

    10.60.27.38 (10.60.27.38:9001) open                    <-- passing result
    10.60.27.38 (10.60.27.38:9001): operation timed out    <-- failing result

Common reasons for failure include:
* Incorrect host or IP address
* Leapwork controller listening on some port other than the default 9001
* A firewall blocking access to the leapwork controller
* The Kaholo agent and leapwork controller being on different networks with no route between them

If network connectivity is open you can then test using the host/IP and port in the form of a URL with the curl method of this plugin. The plugin requires a "Kaholo Account" to be configured, but the `Run Curl Command` makes no use of that account. You may therefore configure a dummy account with nonsense parameters and the curl command will still work. A curl command example is provided below. Be sure to replace `10.60.27.38:9001` with the correct host/IP and port for your Leapwork controller, those found to be "open" in the preceeding steps. The access key and run item ID are not important for the purpose of finding the correct URL.

    curl -X GET --header 'Accept: application/json' --header 'AccessKey: 5A0XDCzVzK03WVr4' 'http://10.60.27.38:9001/api/v4/runItems/d1c45672-3809-4fea-8fd1-01ca949a0fde'

Be sure to try with both `http://` and `https://`, only one of the two will work correctly, depending on how the controller is configured.

At this stage a "successful" connection will return message "Incorrect AccessKey". If you see this you know the URL is correct and you have successfully connected to the Leapwork controller.

    Incorrect AccessKey

To test the access key substitute it in the above curl command. A successful result using a correct Access key is "Asset not found".

    Asset not found

At this stage both `Leapwork URL` and `Access Key` are determined and you may configure a working Kaholo Account for the plugin and proceed to use all methods as designed. Be sure to delete the dummy Kaholo Account to avoid future confusion.

## Access and Authentication
The Leapwork REST API Access Key **IS** the access and authentication for Leapwork. Your Leapwork administrator can configure what level of access each Access Key has. It is possible you got an Access Key that has insufficient permissions to run the methods of the Kaholo plugin. If this is the case, the Leapwork API will return a message such as "AccessKey does not have the relevant scope permission".

    AccessKey does not have the relevant scope permission

If you see this contact your Leapwork Administrators and ask them to add permissions to do the things you intend to do, e.g. run schedules and retreive run items related to "Internal Apps Team Two". The permissions also impact which items are listed in autocomplete parameters.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Method: Run Schedule
This method runs a Leapwork Schedule. The most common schedule to run this way is configured with an "On Demand" trigger, which means it isn't scheduled at all. Each schedule is associated with a Leapwork Run List, which includes one or more Leapwork Flows, i.e. tests. 

### Parameter: Schedule
The autocomplete provides a list of found schedules for convenient selection. If the schedule you seek is not listed, see section [Access and Authentication](##Access-and-Authentication), above.

### Parameter: Variables
Enter variables here as key=value pairs, one per line. These variables are passed to the Leapwork REST API as query parameters in the URL. For example

    color=green
    size=medium

Will append this to the URL to pass the variables to the Leapwork API by adding to the the URL:

    ?color=green&size=medium

The Leapwork Flow can access these variables using a `Get Variable` block of scope "Schedule", and then pass the resulting value to fields of other blocks in the flow. This allows for re-usable flows in Leapwork that can be repurposed by means of simple configuration in Kaholo, using this Variables parameter.

## Method: Get Run Item Ids
The Run Schedule method provides (among other details) a RunId and simple pass/fail information about the run. To get further information or actual test evidence, one must first use the RunId to get the Ids of the Run Items. That is what this method does.

### Parameter: Run Id
The Run Id is the unique identifier of one instance of a run of a Leapwork Schedule. It is found in the output of the `Run Schedule` method and can be accessed at the code layer, for example if the action running "Run Schedule" is `leapwork1`:

    kaholo.actions.leapwork1.result.RunId

## Method: Get Run Items
The output of method "Get Run Item Ids" is just one or more Leapwork Run Item Ids. Another Leapwork call is requried to get the details on each of these items. That is what this method does.

### Parameter: Run Item Ids (Object)
Since there may be any number of run items (and therefore `RunItemId`s), an array of strings is used. For example:

    ["34ba3ed4-2a88-4fdf-8d16-d0942030aece", "922874ad-f5d7-4c84-aeb3-4890e46cc602"]

This is somewhat impractical to enter as a parameter so normally this method is coded to use the RunItemIds directly from an earlier "Get Run Item Ids" action's results. For example if the earlier action is `leapwork2`:

    kaholo.actions.leapwork2.result.RunItemIds

## Method: Run Curl Command
This method runs any leapwork curl command present within the [API](https://www.leapwork.com/product/documentation/rest-api/v4/endpoints) documentation.

While the plugin required a Kaholo Account to be used, and the account appears even in the "Run Curl Command" method, the Kaholo Account is not used in this method. If you wish to use this method and have no valid URL or Access Key for the Kaholo Account, you can simply make a dummy account by providing whatever nonsense URL and Access Key you like.

### Parameter: Curl Command
The actual curl command to run. For example:

    curl -o leapworkvid.mp4 -X GET --header 'Accept: application/octet-stream' --header 'AccessKey: 5A0XDCzVzK03WVr4' 'http://10.60.27.38:9001/api/v4/runItems/245ea20c-2192-45ce-ada6-791948f5aa7c/video'

## Method: Check Active License
This method gets the [active](https://www.leapwork.com/product/documentation/rest-api/v4/get-active-licenses) Leapwork license and can return the number of days for license expiry by default.

### Parameter: Simple Message
This causes the method to return only a simple message expressing how soon the license expires. If not selected, the result is instead JSON including also license ID, activation date, and license type.

    License expires in 12 days!