var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs"),
    pid = require("./Pid");


var Pump = Class({

    constructor: function(config, brewbone, callback) {

        this.events = new lucidjs.EventEmitter();

        this.flowmeter = brewbone.hardware["flowmeters"].get(config.flowmeter);

        this.flowrate = 0;
        
        this.totalizerVol = 0;

        var self = this;
        this.flowmeter.events.on("flowrate", function(data){
        
            self.flowrate = data.flowrate;
            
            self.totalizerVol = data.volume;
            
            if (self.state && (self.mode = "flowrate")){

                self.setPid();
            }

            self.getData(function(err, data){
                self.events.emit("flowChange", data);
            })
            
        });

        this.output = brewbone.hardware["outputs"].get(config.output);

        this.pid = new pid();

        this.mode = "power"; // power (default) or flowrate (pid mode) 

        this.power = 0;

        this.flowTarget = 0;

        this.totalizerPulse = 0;

        this.state = false;

        this.updateConfig(config, function(err) {

            if (callback !== undefined) {
                callback(err)
            };

        });

    },

    updateConfig: function(config, callback) {

      console.log("updating config");

        if (config.name === undefined || !config.name) {
            config.name = this.name
        };
        this.name = config.name;

        if (config.desc === undefined || !config.desc) {
            config.desc = this.desc
        };
        this.desc = config.desc;

        self = this;

        this.getConfig(function(err, config) {

                self.events.emit("updateConfig", config);

                if (callback !== undefined) {
                    callback(null, config)
                };

            }

        );

    },

    getConfig: function(callback) {

        var config = {

            "name": this.name,

            "desc": this.desc,

            "output": this.output.name,

            "flowmeter": this.flowmeter.name

        };

        callback(null, config);

    },

    getData: function(callback) {

        // returns genral pump data

        var data = {

            "name": this.name,

            "state": this.state,

            "power": this.power,

            "mode": this.mode,

            "flowrate": this.flowrate,

            "flowTarget": this.flowTarget,
            
            "volume": this.totalizerVol

        }

        callback(null, data);

    },

    setPower: function(power, callback) {
        this.power = power;
        console.log("Setting Pump Power | " + power);
        
        this.output.setPower(power, callback);
    

        that = this;

        this.getData(function(err, data) {

            that.events.emit("powerChange", data);

        });

        if (callback !== undefined) {
            callback(null, power)
        };

    },

    setState: function(state, callback) {

        // validate incoming argument
        if (typeof state !== "boolean") {
            return callback(new Error("Output- Invalid state assignment: " + state))
        };

        this.output.setState(state, callback);

        this.state = state;

        // emit a stateChange event with the current output setting data

        that = this;

        this.getData(function(err, data) {

            that.events.emit("stateChange", data);

        });

        if (callback !== undefined) {
            callback(null, this.state)
        };
    },

    setFlowTarget: function(flowrate, callback){

        this.flowTarget = flowrate;

        var self = this;

        this.getData(function(data){
            self.events.emit("flowTargetChange", data);
        });

        if (callback !== undefined) {
            callback(null, flowrate)
        };

    },

    setMode: function (mode, callback){

        if (mode = "flowrate"){

            this.mode = "flowrate";

        } else {

            this.mode = "power"; // defaults to power
        
        }

        var self = this;

        this.getData(function(err,data){
            self.events.emit("modeChange", data);
        });

        if (callback !== undefined) {
            callback(null, this.mode)
        };

    },

    setPid: function(){

        this.pid.setTarget(this.flowTarget);

        var prevPower = this.power;

        var self = this;

        this.pid.update(self.flowTarget, function(power){
            self.setPower = power;

            self.getData(function(err, data){
                self.events.emit("data",data);
            })
        })
    },
    
    startTotalizer: function(){
    
    },
    
    stopTotalizer: function(){
    
    },


    $statics: {

        actions: {

            subscribe: function(socket, pump, args) {

                // initialize client with pump data and config

                pump.getData(function(err, data) {

                    socket.emit("pumpData", data);

                })

                pump.getConfig(function(err, config) {

                    socket.emit("pumpConfig", config);

                })

                // subscribe to pump events

                pump.events.on("stateChange", function(data) {

                    socket.emit("pumpData", data);

                })

                pump.events.on("flowChange", function(data) {

                    socket.emit("pumpData", data);

                })

                pump.events.on("flowTargetChange", function(data) {

                    socket.emit("pumpData", data);

                })

                pump.events.on("powerChange", function(data) {

                    socket.emit("pumpData", data);

                })

                pump.events.on("configChange", function(config) {

                    socket.emit("pumpConfig", config);

                })

                pump.events.on("modeChange", function(data){

                    socket.emit("pumpData", data);
                })

            },

            state: function(socket, pump, value) {

                pump.setState(value, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            power: function(socket, pump, value) {

                pump.setPower(value, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            flowTarget: function(socket, pump, value) {

                pump.setFlowrate(value, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            updateConfig: function(socket, pump, value) {

                pump.updateConfig(value, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            getConfig: function(socket, pump, args) {

                pump.getConfig(function(err, config) {

                    socket.emit("outputConfig", config);

                })

            }

        }

    }

});

module.exports = Pump;
