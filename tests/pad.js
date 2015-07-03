var Set = require("collections/set");

var c = new Set();

var objs = [
        {
            "name":"RIMS",
            "type":"DS18B20",
            "unit":"celsius",
            "gpio_pin":"P9_22",
            "w1_address":"28-000003f4efc3",
            "emit_interval":"2000",
            "description":"Reads the temperature of the output from the RIMS system."
        },
        {
            "name":"MLT",
            "type":"DS18B20",
            "unit":"celsius",
            "gpio_pin":"P9_22",
            "w1_address":"28-000003f4db27",
            "emit_interval":"2000",
            "description":"Reads the temperature of the Mash Tun."
        },
        {
            "name":"SYS",
            "type":"DS18B20",
            "unit":"celsius",
            "gpio_pin":"P9_22",
            "w1_address":"28-000004b27a00",
            "emit_interval":"2000",
            "description":"Reads the temperature of the system board."
        }
    ];
    
objs.forEach(function(obj, index, array){
    c.add(obj, obj.name); 
});

console.log(c.length);
console.log(c.get("MLT"));