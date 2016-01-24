require('dotenv').config()
var mondo = require('mondo-bank');
var mondoToken = process.env.mondo_token;
var helpers = require('../helpers.js');
var chrono = require('chrono-node');
module.exports = function(bot, message){
  if(mondoToken){
    bot.reply(message, "These are your accounts: ");
    mondo.accounts(mondoToken, function(err, value){
      var text = value.accounts.map(function(account, index){
        return index + 1 + ". Account: " + account.description;
      }).join("\n");
      bot.reply(message, text);
    });
  }
  else{
    bot.reply(message, "This would display the balance if I had a mondo token :(");
  }
  bot.api.reactions.remove({timestamp: message.ts, channel: message.channel, name: 'thinking_face'},function(err,res) {
    if (err) {
      bot.botkit.log("Failed to remove emoji reaction :(",err);
    }
  });
};