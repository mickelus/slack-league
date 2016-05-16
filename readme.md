#Slack-league
An elo based league system for slack, a nifty tool for keeping a ladder for some game commonly played within your team such as pong or chess. 
Game results are reported in a given slack channel, results and the current ladder can be viewed using slack commands or with a simple web interface.

##Setup
This setup guide assumes that you have nodejs & git installed
###Install the required tools (bower & gulp)
```
npm install -g bower gulp
```
###Clone the repository & change directory
```
git clone https://github.com/mickelus/slack-league.git && cd slack-league
```
###Install dependencies
```
npm install
```
###Configure slack integrations
* Add and create a configuration for a slackbot (https://slack.com/apps/A0F81R8ET-slackbot), note down the token.
* Add and create a configuration for an outgoing webhook (https://slack.com/apps/A0F7VRG6Q-outgoing-webhooks)
    * Add the following trigger words `!report, !ladder, !results, !usage`
    * Enter the url to the machine where you intend to host the bot and append `/pong`, e.g. `127.0.0.1:8080/pong`
    * Note down the token

Note: Slackbot and outgoing webhooks are considered as "Custom Integrations" and do not contribute towards the teams integration limit.

###Set up bot configuration
Create file `config.json` with content:
```
{
    "domain": "",
    "channel": "",
    "apiToken": "",
    "botToken": "",
    "hookToken": "",
    "port": 8080
}
```
Fill in the blanks!

The bot token and the hook token are the tokens you noted down in the previous step, the api token can be found (and generated) here: https://api.slack.com/docs/oauth-test-tokens

###Set up the web interface (optional)
```
cd app
```
```
npm install
```
Note: You may have to run npm install as root/administrator
```
bower install
```
```
gulp build
```
```
cd ..
```

###Start!
```
node main.js
```

##Usage
The following commands are available in slack:

Show usage guide
```
!usage
```

Report results of a game, scores are optional and the reporter is considered the winner if scores are not provided.
```
!report @opponent [reporterScore opponentScore]
```

List the current ladder
```
!ladder
```

List recent results
```
!results
```

The web interface is served from the port specified in the configuration file (or 8080 if the port value is omitted from the config).
