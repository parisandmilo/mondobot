# MondoBot for Slack
MONDO HACK III
Building a mondo-slack integrating running botkit, and mondo-bank

## Setup
`npm install` to install dependencies

`cp .env.example .env` and change the environment variables to your creds - *only* `mondo_token` & `slack_token` are required

To run a test bot locally, you will need to:
- create a new slack app, set `slack_clientId` and `slack_clientSecret` in `.env`
- set `botkit_port=some-port`
- in the slack app, oAuth redirect should be `127.0.0.1:some-port`, and it should auto-create a bot
- install redis and set `local_redis=true`
- run `redis-server` and then `node mondobot.js`
- hit `localhost:some-port/login` it should redirect you to slack, add it to the team you want
- will be redirected to a success page and redis is ready


## Coding style
2 space tabs, tabs translated to spaces

We're using mondo-bank with callback syntax

## To Fix
- `transactions` only works if you `@` the bot
- Catch all errors
- `data.js` don't work but u kind of get it: it's supposed to visualise the transactions onto `index.html` when someone asks for transactions and use webshot to stream it back

## Enhancements
- thinking emojis
- for any queries that are out of context, it send off your query to giphy
- multiple accounts
- transactions should be able to set a date
- transaction aggregation
- visualise le data
- team spending
- team reimbursements
- ML ALL DA THINGS, chrono to parse any dates