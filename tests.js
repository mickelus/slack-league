var Ladder = require("./ladder.js");

var ladder = new Ladder();

console.log("initial ladder", ladder.getRankings());

ladder.addPlayer("mikey");

console.log("added one player", ladder.getRankings());

ladder.addPlayer("mikey");

console.log("added duplicate player", ladder.getRankings());

ladder.addPlayer("elaut");
ladder.addPlayer("bjaure");
ladder.addPlayer("erk");
ladder.addPlayer("antoli");


console.log("added 4 players", ladder.getRankings());

ladder.reportResults("mikey", "bjaure");
ladder.reportResults("mikey", "erk");
ladder.reportResults("bjaure", "elaut");
ladder.reportResults("elaut", "mikey");
ladder.reportResults("elaut", "mikey");


console.log("reported 5 results", ladder.getRankings());
console.log("listing reports", ladder.getRecentReports());