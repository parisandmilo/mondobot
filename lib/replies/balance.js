require('dotenv').config()
var mondo = require('mondo-bank');
var mondoToken = process.env.mondo_token;
var helpers = require('../helpers.js');
module.exports = function(bot, message){
  bot.reply(message, ":horse_racing: , let me just check the Play Book...", function(){
    mondo.accounts(mondoToken, function(err, value){
      if(value.accounts.length == 1){
        var account_id = value.accounts[0].id;
        var text = "Your account belongs to: " + value.accounts[0].description;
        bot.reply(message, text, function(){
          mondo.balance(account_id, mondoToken, function(err, value){
            var text = helpers.formatGBP(value.balance);
            bot.reply(message, {
              text: "You have " + text,
              icon_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
              username: "The Stinsonator"});
          });
        });
      }
    });
  });
};