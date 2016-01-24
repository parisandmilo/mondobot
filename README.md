# MondoBot for Slack
MONDO HACK III
Building a mondo-slack integrating running botkit, and mondo-bank

## Setup
`npm install` to install dependencies

`cp .env.example .env` and change the environment variables to your creds - *only* `mondo_token` & `slack_token` are required

note: you need to `npm start` for your bot to be online. you also have to manually config your bot atm sozzles


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