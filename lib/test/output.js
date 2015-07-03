var b = require("bonescript"),
pin = "P9_21";
b.pinMode(pin, b.OUTPUT);
b.getPinMode(pin,logger);

/*b.digitalWrite(pin, 1, logger);
b.digitalRead(pin,logger);*/


b.analogWrite(pin, .0);
b.analogRead(pin,logger);

function logger(x){
    console.log(x);
}