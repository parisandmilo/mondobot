var chrono = require('chrono-node');

var parsed = chrono.parse('spend from 10th Jan to 20th of Jan'); 
console.log(parsed.map((x)=>(x.start)), parsed.map((x)=>(x.end)));