var tempSensor  = require("./TempSensor"),
    Gpio_Output  = require("./Output"),
    Flowmeter   = require("./Flowmeter"),
    Pump = require("./Pump"),
    Temp_Controller  = require("./TempController");

var exec = require("child_process").exec;
var path = require("path");
var Dict = require("collections/dict");

var brewbone = module.exports = function brewbone (opts) {
  opts = (opts === Object(opts)) ? opts :  {};

  // This allows users to instanciate without the `new` keyword
  if (! (this instanceof brewbone)) {
    return new brewbone(opts);
  }

  // Copy user provided configs to this.config
  for (var key in opts) if ({}.hasOwnProperty.call(opts, key)) {
    this.config[key] = opts[key];
  }
  
// Init w1 Devices
console.log("Checking W1 devices");
path.exists('/lib/firmware/BB-W1-00A0.dtbo',function(exists){
    if(!exists){
	console.log("compiling w1 driver.");
        // Compile the driver code
        try{exec("dtc -O dtb -o BB-W1-00A0.dtbo -b 0 -@ BB-W1-00A0.dts");}
        catch(err){
            console.log("Error compiling W1 driver: " + err);
        }
        // Copy the compiled code to firmware
	console.log("copying w1 compiled code to firmware.");
        try{exec("cp BB-W1-00A0.dtbo /lib/firmware/");}
        catch(err){
            console.log("Error copying compiled W1 driver to firmware: " + err);
        }
    }
})

try{exec("echo BB-W1:00A0 > /sys/devices/bone_capemgr.9/slots");}
catch(err){} // error is thrown if already initialized, ignore.

// Time to initialize based on current configuration
this.name = this.config.name;
this.version = this.config.version;

// Create hardware collections
this.hardware = [];
var self = this;
this.config.hardware.forEach(function(h){
    self.hardware[h.name] = new Dict();
    console.log("created list: " + h.name);
    h.components.forEach(function(c){
        h.construct(c, function(o) {
        	self.hardware[h.name].add(o, o.name);
            console.log(o);
        }, self);
 /*       var objType = h.name.slice(0,h.name.length-1)
        console.log("objType: " + objType);
        var o = Object.create(objType);
        o.updateConfig(c);
        self.hardware[h.name].add(o,o.name);*/
        console.log("added component " + c.name + " to " + h.name);
    });
});
console.log("brewbone initialized");
console.log(this);
}


brewbone.prototype.config = {
    "name":"brewbone",
    "version":"0.0.1",
    "hardware": [
        {
            "name": "tempSensors",
            "construct": function (config, callback) {
            	var obj = new tempSensor(config);
            	callback(obj);
            },
            "components": [
            {
                "name":"rims",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "address":"28-000003f4efc3",
                "emit_interval":"2000",
                "desc":"Temperature of the output from the rims system."
            },
            {
                "name":"mlt",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "address":"28-000003f4db27",
                "emit_interval":"2000",
                "desc":"Temperature of the Mash Tun."
            },
            {
                "name":"hlt",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "address":"28-000003f4db27",
                "emit_interval":"2000",
                "desc":"Temperature of the Hot Liquor Tun."
            },
            {
                "name":"bk",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "address":"28-000003f4db27",
                "emit_interval":"2000",
                "desc":"Temperature of the Boil Kettle."
            },
            {
                "name":"sys",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "address":"28-000004b27a00",
                "emit_interval":"2000",
                "desc":"Reads the temperature of the system board."
            }
            ]
        },
        {
            "name":"outputs",
            "construct": function (config,callback) {
            	var obj = new Gpio_Output(config);
            	callback(obj);
            },
            "components": [
            {
                "name":"rims_pump",
                "isPwm":true,
                "pin":"P9_14",
                "min_power":"0.2",
                "max_power":"1",
                "desc":"Recirculates wort through the rims tube during the mash."
            },
            {
                "name":"mlt_pump",
                "isPwm":true,
                "pin":"P9_16",
                "min_power":"0.2",
                "max_power":"1",
                "desc":"Mash Tun transfer pump."
            },
            {
                "name":"hlt_pump",
                "isPwm":true,
                "pin":"P9_21",
                "min_power":"0.2",
                "max_power":"1",
                "desc":"Hot Liquor transfer pump."
            },
            {
                "name":"rims_heater",
                "isPwm":true,
                "pin":"P9_42",
                "min_power":"0",
                "max_power":".85",
                "desc":"Heating element for controlling wort temp in rims tube."
            },
            {
                "name":"aux1",
                "isPwm":false,
                "pin":"P8_13",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 1."
            },
            {
                "name":"aux2",
                "isPwm":false,
                "pin":"P8_12",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 2."
            },
            {
                "name":"aux3",
                "isPwm":false,
                "pin":"P8_11",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 3."
            },
            {
                "name":"aux4",
                "isPwm":false,
                "pin":"P8_10",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 4."
            },
            {
                "name":"aux5",
                "isPwm":false,
                "pin":"P8_9",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 5."
            },
            {
                "name":"aux6",
                "isPwm":false,
                "pin":"P8_8",
                "min_power":"0",
                "max_power":"1",
                "desc":"Auxillary 120v Number 6."
            },
            {
                "name":"bk_pump",
                "isPwm":false,
                "pin":"P8_7",
                "min_power":"0",
                "max_power":"1",
                "desc":"Boil Kettle Pump"
            },
            {
                "name":"rims_disconnect",
                "isPwm":false,
                "pin":"P8_14",
                "min_power":"0",
                "max_power":"1",
                "desc":"RIMS heating element disconnect."
            }
            ]
        },
        {
            "name":"flowmeters",
            "construct": function (config,callback) {
            	var obj = new Flowmeter(config);
            	callback(obj);
            },
            "components":[
                    {
                        "name":"rims",
                        "type":"ada_828",
                        "pin":"P9_13",
                        "unit":"liters",
                        "desc":"Calculates the flow rate of the rims system."
                    },
                    {
                        "name":"mlt",
                        "type":"ada_828",
                        "pin":"P9_15",
                        "unit":"liters",
                        "desc":"Calculates the flow rate of the mlt pump."
                    },
                    {
                        "name":"hlt",
                        "type":"ada_828",
                        "pin":"P9_41",
                        "unit":"liters",
                        "desc":"Calculates the flow rate of the hlt pump."
                    },
                    {
                        "name":"bk",
                        "type":"ada_833",
                        "pin":"P9_23",
                        "unit":"liters",
                        "desc":"Calculates the flow rate of the bk pump."
                    }
            ]
        },
        {
            "name":"pumps",
            "construct": function (config,callback, brewbone) {
                console.log("creating pump from " + brewbone.config.name);
                var obj = new Pump(config, brewbone);
                callback(obj);
            },
            "components":[
                    {
                        "name":"rims",
                        "flowmeter":"rims",
                        "output":"rims_pump",
                    },
                    {
                        "name":"mlt",
                        "flowmeter":"mlt",
                        "output":"mlt_pump",
                    },
                    {
                        "name":"hlt",
                        "flowmeter":"hlt",
                        "output":"hlt_pump",
                    } ,
                    {
                        "name":"bk",
                        "flowmeter":"bk",
                        "output":"bk_pump",
                    } 
            ]
        },
        {
            "name":"tempControllers",
            "construct": function (config,callback, brewbone) {
            	var obj = new Temp_Controller(config, brewbone);
            	callback(obj);
            },
            "components":[
                    {
                        "name":"rims",
                        "input":"rims",
                        "output":"rims_heater",
                    } 
            ]
        }
    ]
};

brewbone.prototype.configure = function configure (key, val) {
  this.config[key] = val;
  return this;
};