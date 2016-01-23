require('dotenv').config();
if (!process.env.slack_token) {
    console.log('Error: Specify Slack token in environment');
    process.exit(1);
}
if (!process.env.mondo_token) {
    console.log('Error: Specify Mondo token in environment');
    process.exit(1);
}
var mondo = require('mondo-bank');
var mondoToken = process.env.mondo_token;

var d3 = require("d3");
    jsdom = require("jsdom");

var document = jsdom.jsdom(),
    svg = d3.select(document.body).append("svg");



module.exports = function() { 
    this.visualise = function visualise (data) {
	// TAKE IN THE JSON & DO SMTH
	console.log("hi" + data);

}
    this.multiply = function(a,b) { return a*b };
    //etc
}