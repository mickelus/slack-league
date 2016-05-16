var extend      = require("extend"),
    Elo         = require("elo-rank"),
    express     = require("express"),
    request     = require("request"),
    bodyParser  = require("body-parser"),
    fs          = require("fs"),
    jsonfile    = require("jsonfile"),
    moment      = require("moment-timezone");

module.exports = function(configExtension, ladder) {
    var config = {
        port: 8080,
        domain: "",
        channel: "",
        apiToken: "",
        botToken: "",
        hookToken: ""
    };
    extend(config, configExtension);

    var userData = {};

    extend(this, {

    });

    request.get("https://slack.com/api/users.list?token=" + config.apiToken, function(error, response, bodyRaw) {
        var body = JSON.parse(bodyRaw);
        if (body.ok) {
            var rankings = ladder.getRankings();
            for (var i = 0; i < body.members.length; i++) {
                var user = body.members[i];
                for (var j = 0; j < rankings.length; j++) {
                    if (user.name == rankings[j].name) {
                        updateUserData(user);
                        break;
                    }
                }
            }
            console.log("Fetching user data complete!");
        } else {
            console.log("Failed to fetch initial user data");
        }
    })

    var app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static('app/dist'));
    app.listen(config.port);
    console.log('Now accepting connections on port:' + config.port);

    app.post('/pong', function(req, res) {
        if (req.body.token != config.hookToken) {
            console.log("Received request with invalid token");
            return;
        }

        if(req.body.trigger_word == "!report") {
            console.log(timestamp(), "report req", req.connection.remoteAddress)
            handleReport(res, req.body);
        } else if (req.body.trigger_word == "!ladder") {
            console.log(timestamp(), "ladder req", req.connection.remoteAddress);
            handleLadder(res);
        } else if (req.body.trigger_word == "!results") {
            console.log(timestamp(), "results req", req.connection.remoteAddress);
            handleResults(res);
        } else if (req.body.trigger_word == "!usage") {
            console.log(timestamp(), "usage req", req.connection.remoteAddress);
            sendMessage(usage());
        }

    });
    app.get('/api/ladder', function(req, res) {
        var rankings = ladder.getRankings();
        var result = [];
        for (var i = 0; i < rankings.length; i++) {
            var item = {
                score: rankings[i].score
            }
            extend(item, userData[rankings[i].name]);
            result.push(item);
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.status(200);
        res.json(result);
    });
    app.get('/api/reports', function(req, res) {
        var reports = ladder.getRecentReports();
        var result = [];
        for (var i = 0; i < reports.length; i++) {
            var report = reports[i];
            var item = {};
            var winner = userData[report.winner];
            var loser = userData[report.loser];
            extend(item, report);
            extend(item, {
                winnerData: winner,
                loserData: loser
            });
            result.push(item);
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.status(200);
        res.json(result);
    });

    function handleReport(res, body) {
        var result      = body.text.split(" "),
            winner      = body.user_name,
            loser,
            winnerScore = 0, 
            loserScore  = 0;

        res.sendStatus(200);
        if (result.length>=2) {
            parseLoser(result[1], function(loser) {
                var scoreChange = 0;
                if (!loser) {
                    sendMessage("Invalid usage of `!report`: missing name of losing side. Example: \n> !challenge @slackbot", winner);
                    return;
                }

                request.get("https://slack.com/api/users.info?token=${config.apiToken}&user=${body.user_name}", function(error, response, bodyRaw) {
                    var body = JSON.parse(bodyRaw);
                    if (body.ok) {
                        updateUserData(body.user);
                    }
                });

                if (!ladder.playerExists(winner)) {
                    ladder.addPlayer(winner);
                }
                if (!ladder.playerExists(loser)) {
                    ladder.addPlayer(loser);
                }

                if (result.length > 3) {
                    winnerScore = parseInt(result[2]);
                    loserScore = parseInt(result[3]);

                    if (isNaN(winnerScore) || isNaN(loserScore)) {
                        sendMessage("Invalid usage of `!report`: Unexpected score values. Example: \n> !challenge @slackbot 3 2", winner);
                        return;
                    }

                    if (winnerScore < loserScore) {
                        var temp = winner;
                        winner = loser;
                        loser = temp;

                        temp = winnerScore;
                        winnerScore = loserScore;
                        loserScore = temp;
                    }
                }

                scoreChange = ladder.reportResults(winner, loser, winnerScore, loserScore);
                sendMessage(">*${winner}* gains *${scoreChange}* points by defeating *${loser}*");

            }, function() {
                sendMessage("An error occured when communicating with the slack API, too bad :I.", winner);
            });
        } else {
            sendMessage("Invalid usage of `!report`: missing name of losing side. Example: \n> !challenge @slackbot", winner);
        }
    }

    function handleLadder(res) {
        var message;
        var rankings = ladder.getRankings();

        if (rankings.length > 0 ) {
            message = "Current ladder:\n```";
            message+= "Rank " + padRight("Name", 30) + "Score\n";
            message+= "========================================\n";
            for (var i = 0; i < rankings.length; i++) {
                message+= padRight(i + 1, 5) 
                        + padRight(rankings[i].name, 30)
                        + padLeft(rankings[i].score, 5) + "\n";
            };
            message+= "```";
        } else {
            message = "The ladder is empty :(, go get em tiger!";
        }
        sendMessage(message);
        res.sendStatus(200);
    }

    function handleResults(res) {
        var message;
        var reports = ladder.getRecentReports();

        if (reports.length > 0 ) {
            var maxNameLength = 0;
            for (var i = 0; i < reports.length; i++) {
                if (reports[i].winner.length > maxNameLength) {
                    maxNameLength = reports[i].winner.length;
                }
                if (reports[i].loser.length > maxNameLength) {
                    maxNameLength = reports[i].loser.length;
                }
            };
            maxNameLength++;
            message = "Recent results:\n```";
            message+= padRight("Time", 16) + padLeft("Winner", maxNameLength) + " Score " + padRight("Loser", maxNameLength) + "\n";
            message+= "=======================";
            for (var i = 0; i < maxNameLength; i++) {
                message+= "==";
            };
            message+="\n";
            for (var i = 0; i < reports.length; i++) {
                message+= timestamp(reports[i].date) 
                        + padLeft(reports[i].winner, maxNameLength)
                        + padLeft(reports[i].winnerScore, 3) + "-"
                        + padRight(reports[i].loserScore, 3)
                        + padRight(reports[i].loser, maxNameLength) + "\n";
            };
            message+= "```";
        } else {
            message = "There are no reports :(";
        }
        sendMessage(message);
        res.sendStatus(200);
    }

    function parseLoser(userID, successCallback, errorCallback) {
        var user = userID.substring(2, userID.length - 1);
        request.get("https://slack.com/api/users.info?token=${config.apiToken}&user=${user}", function(error, response, bodyRaw) {
            var body = JSON.parse(bodyRaw);
            if (body.ok) {
                updateUserData(body.user);
                successCallback(body.user.name);
            } else {
                errorCallback(body);
            }
        });
    }

    function updateUserData(user) {
        userData[user.name] = {
            username: user.name,
            name: user.profile.real_name,
            imageLarge: user.profile.image_192,
            imageMedium: user.profile.image_48,
            color: user.color
        }
    }


    function sendMessage(message, target) {
        var channel =  target ? ('@' + target) : ('%23' + config.channel);
        request.post("https://${config.domain}.slack.com/services/hooks/slackbot?token=${config.botToken}&channel=${channel}", { body: message });
    }

    function padRight(string, length) {
        return (string + "                                            ").slice(0, length); // :3
    }

    function padLeft(string, length) {
        return ("                                            " + string).slice(-length); // :3
    }

    function timestamp(date) {
        return "[" + moment(date).tz("Europe/Stockholm").format("YY/MM/DD HH:mm") + "]";
    }

    function usage() {
        return "Report victories against other players (the reporter is considered as the winner unless scores are provided):\n"
             + ">!report @opponent [reporterScore opponentScore]\n"
             + "List the current ladder:\n"
             + ">!ladder\n"
             + "List recent results:\n"
             + ">!results\n";
    }

    return this;
}
