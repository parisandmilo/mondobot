var helpers= {};

helpers.formatGBP = function(value){
  var str = value +'';
  var len = str.length;
  var text = str.slice(0, len - 2) + "." + str.slice(len - 2, len) + " GBP";
  return text;
};

helpers.formatDate = function(chrono){
  var start = chrono[0].start.knownValues;
  var end = chrono[0].end.knownValues;
  var date = start.day + '/' + start.month + '/' + start.year;
  // return chronoKnownValue.day + '' + chronoKnownValue.month + '' + chronoKnownValue.year;
  return date;
}
module.exports = helpers;