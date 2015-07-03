var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs");

var Config = Class({

	getConfig: function(){
			return ConfigData;
	},

	getConfigOfType: function(type){
        return ConfigData[type];
	}

})

var ConfigData = {

/*"views": {
    "template": "default",
    "pages": [
        {"brew_dashboard":{
            "components": [
                "tempSensors":{["rims","mlt","bk","hlt"]},
                "tempControllers":["rims"],
                "pumps":["rims","mlt","hlt","bk"],
                "outputs":["aux1","aux2","aux3","aux4","aux5","aux6"]
            ]
        }
    }
    ]
},*/

"hardware": [
        {
            "name": "tempSensors",
            "construct": function (config, callback) {
            	var obj = new Temp_Sensor(config);
            	callback(obj);
            },
            "components": [
            {
                "name":"rims",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "w1_address":"28-000003f4efc3",
                "emit_interval":"2000",
                "description":"Reads the temperature of the output from the rims system."
            },
            {
                "name":"mlt",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "w1_address":"28-000003f4db27",
                "emit_interval":"2000",
                "description":"Reads the temperature of the Mash Tun."
            },
            {
                "name":"sys",
                "type":"DS18B20",
                "unit":"celsius",
                "gpio_pin":"P9_22",
                "w1_address":"28-000004b27a00",
                "emit_interval":"2000",
                "description":"Reads the temperature of the system board."
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
                "pwm":true,
                "gpio_pin":"P9_14",
                "min_power":"0.2",
                "max_power":"1",
                "description":"Recirculates wort through the rims tube during the mash."
            },
            {
                "name":"mlt_pump",
                "pwm":true,
                "gpio_pin":"P9_16",
                "min_power":"0.2",
                "max_power":"1",
                "description":"Mash Tun transfer pump."
            },
            {
                "name":"hlt_pump",
                "pwm":true,
                "gpio_pin":"P9_21",
                "min_power":"0.2",
                "max_power":"1",
                "description":"Hot Liquor transfer pump."
            },
            {
                "name":"rims_heater",
                "pwm":true,
                "gpio_pin":"P8_13",
                "min_power":"0",
                "max_power":"1",
                "description":"Heating element for controlling wort temp in rims tube."
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
                        "type":"ada_833",
                        "gpio_pin":"P8_7",
                        "unit":"liters",
                        "description":"Calculates the flow rate of the rims system."
                    },
                    {
                        "name":"mlt",
                        "type":"ada_828",
                        "gpio_pin":"P8_9",
                        "unit":"liters",
                        "description":"Calculates the flow rate of the rims system."
                    },
                    {
                        "name":"hlt",
                        "type":"ada_828",
                        "gpio_pin":"P8_10",
                        "unit":"liters",
                        "description":"Calculates the flow rate of the rims system."
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



module.exports = Config;