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

if (!process.env.slack_token) {
    console.log('Error: Specify Slack token in environment');
    process.exit(1);
}
if (!process.env.mondo_token) {
    console.log('Error: Specify Mondo token in environment');
    process.exit(1);
}

var mondo = require('mondo-bank');
var Botkit = require('botkit');

var mondoToken = process.env.mondo_token;

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.slack_token
}).startRTM();

controller.on('bot_channel_join', function(bot, message){
    bot.say({
        channel: message.channel,
        text: "Yo wassup"
    });
});
controller.hears(['hello','hi'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "hello");
});
controller.hears(['mondo'], 'ambient', function(bot, message){
  bot.reply(message, "Hey, I'm the MondoBot" + String.fromCharCode(169));
});
//this is where the API integration starts
controller.hears(['account', 'accounts'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "These are your accounts: ");
  mondo.accounts(mondoToken, function(err, value){
    var i = 0;
    var text = value.accounts.map(function(account){
      i++;
      return i + ". Account: " + account.id + ", " + account.description;
    }).join("\n");
    bot.reply(message, text);
  });
});
controller.hears(['balance(.*)'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "Getting balance", function(){
    mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Account: " + value.accounts[0].description + ", id: " + account_id;
        console.log(text);
        bot.reply(message, text, function(){
          mondo.balance(account_id, mondoToken, function(err, value){
            var balanceStr = value.balance +'';
            var len = balanceStr.length;
            var text = balanceStr.slice(0, len - 2) + "." + balanceStr.slice(len - 2, len) + " GBP";
            bot.reply(message, text);
          });
        });
      }
    });
  });
});