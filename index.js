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

function formatGBP(value){
  var str = value +'';
  var len = str.length;
  var text = str.slice(0, len - 2) + "." + str.slice(len - 2, len) + " GBP";
  return text;
}

var bot = controller.spawn({
    token: process.env.slack_token
}).startRTM();

controller.on('bot_channel_join', function(bot, message){
    bot.say({
        channel: message.channel,
        text: "Hello I'm your MondoBot!!!"
    });
});

controller.hears(['hello','hi'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "hello");
});
//spambot
controller.hears(['mondo'], 'ambient', function(bot, message){
  bot.reply(message, "Hey, I'm the MondoBot" + String.fromCharCode(169));
});
//this is where the API integration starts

//accounts
controller.hears(['account', 'accounts'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "These are your accounts: ");
  mondo.accounts(mondoToken, function(err, value){
    var text = value.accounts.map(function(account, index){
      return index + 1 + ". Account: " + account.id + ", " + account.description;
    }).join("\n");
    bot.reply(message, text);
  });
});

//balance command
controller.hears(['balance(.*)'], 'direct_message,direct_mention,mention', function(bot, message){
  bot.reply(message, "Getting balance", function(){
    mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Account: " + value.accounts[0].description + ", id: " + account_id;
        bot.reply(message, text, function(){
          mondo.balance(account_id, mondoToken, function(err, value){
            var text = formatGBP(value.balance);
            bot.reply(message, text);
          });
        });
      }
    });
  });
});

//transactions command
controller.hears(['transactions'], 'direct_message,direct_mention,mention', function(bot, message){
	bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'thinking_face',
  },function(err,res) {
    if (err) {
      bot.botkit.log("soz no emoji lulz",err);
    }
  });
  bot.reply(message, "Getting transactions", function(){
    mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Account: " + value.accounts[0].description + ", id: " + account_id;
        bot.reply(message, text, function(){
          mondo.transactions(account_id, mondoToken, function(err, value){

            var text = JSON.stringify(value.transactions);
            var text = value.transactions.map(function(transaction, index){
              return index + 1 + ". transaction: " + transaction.description + ", " + transaction.description + ", " + formatGBP(transaction.amount);
            }).join("\n");
            bot.reply(message, text);
            bot.api.reactions.remove({
					    timestamp: message.ts,
					    channel: message.channel,
					    name: 'thinking_face',
					    },function(err,res) {
					    if (err) {
					      bot.botkit.log("soz i failed",err);
					    }
					  }); 
					  bot.reply(message,{
					  		icon_emoji: ":rocket:",
					  		username: "simplebot",
					      text: ":smoking: simple.",
					    });
          });
        });
      }
      else {
      	bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'slightly_frowning_face',
          },function(err,res) {
          if (err) {
            bot.botkit.log("soz no emoji lulz",err);
          }
          });
      	bot.reply(message, "you have no transactions LOL go spend dat moniez $$$");
      }
    });    
  });
});
