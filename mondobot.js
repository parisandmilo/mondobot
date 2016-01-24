
require('dotenv').config();

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit'),
  redisConfig = {"url": process.env.REDIS_URL},
  redisStorage = require('botkit/lib/storage/redis_storage')(redisConfig);

if(process.env.local_redis){
  // is this a hack? maybe
  redisStorage = require('botkit/lib/storage/redis_storage')();
}
  
var mondo = require('mondo-bank');

var Witbot = require("witbot")
if (!process.env.slack_clientId || !process.env.slack_clientSecret || !process.env.botkit_port) {
  console.log('Error: Specify slack_clientId slack_clientSecret and botkit_port in environment');
  process.exit(1);
}
if (!process.env.mondo_client_secret) {
    console.log('Error: Specify Mondo client secret in environment');
    process.exit(1);
}

if (!process.env.wit_token) {
    console.log('Error: Specify wit_token in environment');
    process.exit(1);
}

var mondoToken = process.env.mondo_token;
var witbot = Witbot(process.env.wit_token);
var helpers = require('./lib/helpers.js');

var controller = Botkit.slackbot({
  storage: redisStorage

}).configureSlackApp(
  {
    clientId: process.env.slack_clientId,
    clientSecret: process.env.slack_clientSecret,
    scopes: ['bot'],
  }
);

controller.setupWebserver((process.env.PORT || process.env.botkit_port),function(err,webserver) {
  webserver.get("/", function(req, res){
    res.send('<a href="https://slack.com/oauth/authorize?scope=bot&client_id=16839103392.19247485637"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>')
  });
  webserver.get('/mondo-oauth/:user', function(req,res){
    var userId = req.params.user;

    //get code from querystring
    var auth_code = req.query.code;
    console.log("Auth code", auth_code);

    //Final Oauth Step
    var grant_type = "authorization_code";
    var client_id = "oauthclient_0000932nzeY7632WKef0oj";
    var client_secret = process.env.mondo_client_secret;
    controller.storage.users.get(userId, function (err, user){
      console.log("user", user);
      var redirectURI = user.mondo_redirectURI;
      console.log("Redirect URI", redirectURI);

      var request = require("request");

      url = "https://api.getmondo.co.uk/oauth2/token"
      request({
        "url": url,
        "form": {
          "grant_type": grant_type,
          "client_id": client_id,
          "client_secret": client_secret,
          "redirect_uri": redirectURI,
          "code": auth_code,
        },
        method: "POST"
        }, function (error, response, body) {
          data = JSON.parse(body);

          user.mondoToken = data.access_token;
          controller.storage.users.save(user, function(err, id) {
            console.log(user);
          });


      })
    });


    res.send("Success! Go back to Slack and start talking to your bank.");
  });
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});


// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function(err) {

      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

    });
  }

});


// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

controller.hears('hello','direct_message',function(bot,message) {
  bot.reply(message,'Hello!');
  controller.storage.users.get(message.user, function(err, user){
    if(user.mondoToken&&user){
      // mondo.accounts(user.)
    }
    else{
      var oauthClientId = "oauthclient_0000932nzeY7632WKef0oj";
      var redirectURI = "http://mondoslackbot.herokuapp.com/mondo-oauth/" + message.user + "/";
      var final_url = "https://auth.getmondo.co.uk/?client_id=" + oauthClientId + "&redirect_uri=" + redirectURI + "&response_type=code"

      //store redirectURI

        user.mondo_redirectURI = redirectURI;
        controller.storage.users.save(user, function(err, id) {
          console.log(user);
          });

      bot.reply(message, "Hi there click here to access mondo: " + final_url);
    }
  });
});

controller.hears('^stop','direct_message',function(bot,message) {
  bot.reply(message,'Goodbye');
  bot.rtm.close();
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});

controller.hears('.*', 'direct_message, direct_mention', function (bot, message) {
  //Add "working on it" reaction
    bot.api.reactions.add({timestamp: message.ts, channel: message.channel, name: 'thinking_face'},function(err,res) {
      if (err) {
        bot.botkit.log("Failed to add emoji reaction :(",err);
      }
    });

  var wit = witbot.process(message.text, bot, message);
  wit.hears("transaction", 0.5, function(bot, message, outcome){
    bot.botkit.log("transaction");
    console.log(bot);
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'thinking_face',
    },function(err,res) {
      if (err) {
        bot.botkit.log("soz no emoji lulz",err);
      }
    });
    var holder = "I'm working man... :man_in_business_suit_levitating:";
    bot.reply(message, holder, function(){
      controller.storage.users.get(message.user, function(err, user){
        mondoToken = user.mondoToken;
        mondo.accounts(mondoToken, function(err, value){
        if(value.accounts.length == 1){
          var account_id = value.accounts[0].id;
          var text = "Your account belongs to: " + value.accounts[0].description + ", id: " + account_id;
          bot.reply(message, text, function(){
            mondo.transactions(account_id, mondoToken, function(err, value){
              console.log(err);
              var text = value.transactions.map(function(transaction, index){
                return index + 1 + ". transaction: " + transaction.description + ", " + transaction.description + ", " + helpers.formatGBP(transaction.amount);
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
                text: ":smoking: simple.",
                icon_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
                username: "Barney",
                image_url: "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/04/1428562937barney.gif",
              });
              bot.api.reactions.remove({timestamp: message.ts, channel: message.channel, name: 'thinking_face'},function(err,res) {
                if (err) {
                  bot.botkit.log("Failed to remove emoji reaction :(",err);
                }
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
  });
  wit.hears("account", 0.5, function(bot, message, outcome){
    controller.storage.users.get(message.user, function(err, user){
      mondoToken = user.mondoToken;
      if(mondoToken){
        bot.reply(message,  "Hit me up, Barney ");
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
    });
  });
  wit.hears("balance", 0.5, function(bot, message, outcome){
    bot.reply(message, ":horse_racing: , let me just check the Play Book...", function(){
      controller.storage.users.get(message.user, function(err, user){
        mondoToken = user.mondoToken;
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
    });
  });

  wit.otherwise(require('./lib/replies/giph.js'));
})

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    console.log("Team ", t);
    if (teams[t].bot) {
      var bot = controller.spawn(teams[t]).startRTM(function(err) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }

});