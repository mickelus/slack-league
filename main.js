var Ladder      = require("./ladder.js"),
    Slack       = require("./slack.js"),
    jsonfile    = require("jsonfile"),
    fs          = require("fs");

var config, ladder, slack;

if (fs.existsSync("config.json")) {
    config = jsonfile.readFileSync("config.json", {throws: false});
}

if (!config) {
    config = {};
}

ladder = new Ladder(config);
slack = new Slack(config, ladder);