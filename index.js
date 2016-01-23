var mondo = require('mondo-bank');
require('dotenv').config();

mondo.token({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    username: process.env.username,
    password: process.env.password
  }, 
  function(err, value){
    //value is the token here
    //Do some stuff :)
  }
);