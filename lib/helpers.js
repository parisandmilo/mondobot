var helpers= {};

helpers.formatGBP = function(value){
  var str = value +'';
  var len = str.length;
  var text = str.slice(0, len - 2) + "." + str.slice(len - 2, len) + " GBP";
  return text;
};
module.exports = helpers;