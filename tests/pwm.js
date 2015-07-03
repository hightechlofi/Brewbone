var b = require("bonescript");
var pin = "P9_14";
b.pinMode(pin, b.OUTPUT);
b.analogWrite(pin,1);
setTimeout(function(){b.analogWrite(pin,0);},10000);