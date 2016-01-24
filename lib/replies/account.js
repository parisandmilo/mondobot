require('dotenv').config()
var mondo = require('mondo-bank');
var mondoToken = process.env.mondo_token;
var helpers = require('../helpers.js');
var chrono = require('chrono-node');
module.exports = function(bot, message){
  if(mondoToken){
    bot.reply(message, "Hit me up, Barney");
    mondo.accounts(mondoToken, function(err, value){
      var text = value.accounts.map(function(account, index){
        return "CHECK IT :man_in_business_suit_levitating: \n" + index + 1 + ". Account: " + account.description;
      }).join("\n");
      bot.reply(message, {
        text: text,
        icon_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
        username: "The Stinsonator"});
    });
  }
  else{
    bot.reply(message, {
      text: "This would display the balance if I had a mondo token :frowning:",
      username: "failwhale",
      icon_url: "http://media.giphy.com/media/PIfV4QbNzslYQ/giphy.gif"
    });
  }
  bot.api.reactions.remove({timestamp: message.ts, channel: message.channel, name: 'thinking_face'},function(err,res) {
    if (err) {
      bot.botkit.log("Failed to remove emoji reaction :(",err);
    }
  });
};