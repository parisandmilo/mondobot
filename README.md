# MondoBot for Slack
MONDO HACK III
Building a mondo-slack integrating botkit, wit.ai, giphy and mondo-bank

## Setup
`npm install` to install dependencies

`cp .env.example .env` and change the environment variables to your creds:

To run a test bot locally, you will need to:
- create a new slack app, set `slack_clientId` and `slack_clientSecret` in `.env`
- create a new mondo oauth client and set `mondo_client_secret` as an env variable and set the mondo client id right inside `mondobot.js`
- set `botkit_port=some-port`
- in the slack app, oAuth redirect should be `127.0.0.1:some-port`, and it should auto-create a bot
- install redis and set `local_redis=true` (If you want to run this with a remote redis server, you need to set `local_redis=false` and define a `REDIS_URL`)
- run `redis-server` and then `node mondobot.js`
- hit `localhost:some-port/login` it should redirect you to slack, add it to the team you want
- will be redirected to a success page and redis is ready



# Heroku
For this to run on Port 80 on Heroku you need to set `PORT` as an envornment variable within Heorku



## Coding style
2 space tabs, tabs translated to spaces

We're using mondo-bank with callback syntax

## To Fix
- `transactions` only works if you `@` the bot
- Catch all errors
- webshot streaming back to slack - not saving the file
- have all the `.hears("")` added to wit.ai

## Enhancements
- DONE: thinking emojis
- DONE: for any queries that are out of context, it send off your query to giphy
- DONE: multiple accounts (oAuth through Mondo 3-legged web auth stored in Redis)
- transactions should be able to set a date range
- transaction aggregation
- add a help menu (of the commands that can be done and how)
- visualise le data
- team spending
- team reimbursements
- DOING ML ALL DA THINGS, chrono to parse any dates