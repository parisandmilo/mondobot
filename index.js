var mondo = require('mondo-bank');
require('dotenv').config();

// mondo.token({
//     client_id: process.env.mondo_client_id,
//     client_secret: process.env.mondo_client_secret,
//     username: process.env.mondo_username,
//     password: process.env.mondo_password
//   }, 
//   function(err, value){
//     //value is the token here
//     //Do some stuff :)
//   }
// );
var mondoToken = process.env.mondo_token;

if (!process.env.slacktoken) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

controller.on('bot_channel_join', function(bot, message){
    bot.say({
        channel: message.channel,
        text: "Yo wassup"
    });
});

controller.hears(['account', 'accounts'], 'direct_message,direct_mention,mention', function(bot, message){
  mondo.accounts(mondoToken, function(err, value){
    var text = JSON.stringify(value);
    bot.reply(message, text);
  });
});