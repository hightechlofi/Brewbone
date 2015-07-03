var Dict = require("collections/dict");

var dict = new Dict;

var brewbone = {"name":"brewbone"};

brewbone.hardware = [];

var o = {"name": "obj","value":1};
var o2 = {"name": "obj2","value":2};

brewbone.hardware["temp"] = new Dict;
brewbone.hardware["temp"].add(o, o.name);
brewbone.hardware["temp"].add(o2,o2.name);

console.log(brewbone.hardware["temp"].get(o.name));
console.log(brewbone.hardware["temp"].get(o2.name));