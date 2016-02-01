var extend      = require("extend"),
    Elo         = require("elo-rank"),
    fs          = require("fs"),
    jsonfile    = require("jsonfile");

module.exports = function(configExtension) {
    var config = {
        startingElo: 1620,
        k: 32,
        historyLength: 32,
        ladderPersistenceFile: "ladder.json",
        reportsPersistenceFile: "reports.json"
    };
    extend(config, configExtension);

    var elo = new Elo(config.k);
    var ladder = {};
    var reports = [];

    restore();

    extend(this, {
        addPlayer: addPlayer,
        playerExists: playerExists,
        getRankings: getRankings,
        reportResults: reportResults,
        getRecentReports: getRecentReports
    });

    function restore() {
        var persistedLadder;
        var persistedReports;

        if(config.ladderPersistenceFile && fs.existsSync(config.ladderPersistenceFile)) {
            persistedLadder = jsonfile.readFileSync(config.ladderPersistenceFile, {throws: false});
        }
        if(config.reportsPersistenceFile && fs.existsSync(config.reportsPersistenceFile)) {
            persistedReports = jsonfile.readFileSync(config.reportsPersistenceFile, {throws: false});
        }

        if (persistedLadder) {
            ladder = persistedLadder;
        }
        if (persistedReports) {
            reports = persistedReports;
        }
    }

    function persist() {
        if(config.ladderPersistenceFile) {
            jsonfile.writeFile(config.ladderPersistenceFile, ladder, {spaces: 4, flags: 'w', throws: false});
        }
        if(config.reportsPersistenceFile) {
            jsonfile.writeFile(config.reportsPersistenceFile, reports, {spaces: 4, flags: 'w', throws: false});
        }
    }

    function addPlayer(name) {
        console.log("adding player", name, config.startingElo);
        if (!playerExists(name)) {
            ladder[name] = config.startingElo;
        }
    }

    function playerExists(name) {
        return !!ladder[name];
    }

    function getRankings() {
        var rankings = [];
        Object.keys(ladder).forEach(function(key) {
            var i = 0;
            for (i = 0; i < rankings.length; i++) {
                if (rankings[i].score < ladder[key]) {
                    break;
                }
            };
            rankings.splice(i, 0, {
                "name": key,
                "score": ladder[key]
            });
        });
        return rankings;
    }

    function reportResults(winner, loser, winnerScore, loserScore) {
        var winnerExpected = elo.getExpected(ladder[winner], ladder[loser]);
        var loserExpected = elo.getExpected(ladder[loser], ladder[winner]);

        var winnerUpdated = elo.updateRating(winnerExpected, 1, ladder[winner]);
        var loserUpdated = elo.updateRating(loserExpected, 0, ladder[loser]);

        var change = winnerUpdated - ladder[winner];

        storeReport(winner, ladder[winner], winnerUpdated, winnerScore, loser, ladder[loser], loserUpdated, loserScore);

        ladder[winner] = winnerUpdated;
        ladder[loser] = loserUpdated;

        persist();

        return change;
    }

    function storeReport(winner, winnerPrevRating, winnerNewRating, winnerScore, 
            loser, loserPrevRating, loserNewRating, loserScore) {
        reports.unshift({
            date: new Date(),
            winner: winner,
            winnerPrevRating: winnerPrevRating,
            winnerNewRating: winnerNewRating,
            winnerScore: winnerScore, 
            loser: loser,
            loserPrevRating: loserPrevRating,
            loserNewRating: loserNewRating,
            loserScore: loserScore
        });

        reports.splice(config.historyLength, reports.length - config.historyLength);
    }

    function getRecentReports() {
        return reports;
    }

    return this;
}
