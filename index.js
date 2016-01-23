var mondo = require('mondo-bank');
require('dotenv').config();

mondo.token({
    client_id: process.env.mondo_client_id,
    client_secret: process.env.mondo_client_secret,
    username: process.env.mondo_username,
    password: process.env.mondo_password
  }, 
  function(err, value){
    //value is the token here
    //Do some stuff :)
  }
);