var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    fs = require("fs"),
    exec = require("child_process").exec,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs");



var TempSensor = Class({

    constructor: function(opts, callback) {

        this.events = new lucidjs.EventEmitter();

        this.updateConfig(opts);
        
        this.path = "/sys/bus/w1/devices/" + this.address + "/w1_slave";

        this.readSensor(function(err,temp){
            this.prevTemp = temp;
            this.temp = temp;
        });

        this.emitInterval = 1000;

        var self = this;

        this.emitData = function() {
            
            self.readSensor(function(err, temp) {



                if (temp !== self.prevTemp && !isNaN(temp)) {

                    self.temp = temp;

                    var timestamp = new Date().toJSON()

                    var data = {

                        "name": self.name,

                        "temp": self.temp,

                        "timestamp": timestamp

                    };

                    self.events.emit("tempChange", data);

                    self.prevTemp = self.temp;
                    
                    console.log("temp reading| " + self.name + " | " + self.temp);

                };

                setTimeout(self.emitData, self.emitInterval);

            });

        }

        this.emitData();

        if(typeof callback === "function"){
            callback(this);
        }

    },

    updateConfig: function(opts, callback) {

        // Verify opts and update configuration with valid opts

        if(opts.address === undefined || !opts.address) {opts.address = this.address;}
        this.address = opts.address;

        if(opts.type === undefined || !opts.type) {opts.type = this.type;}
        this.type = opts.type;

        if(opts.name === undefined || !opts.name) {opts.name = this.name;}
        this.name = opts.name;

        if(opts.desc === undefined || !opts.desc) {opts.desc = this.desc;}
        this.desc = opts.desc;

        if(opts.emitInterval === undefined || !opts.emitInterval) {opts.emitInterval = this.emitInterval;}
        this.emitInterval = opts.emitInterval;

        // return updated config data and emit configChange event

        that = this;

        this.getConfig(function(err, config) {

            that.events.emit("configChange", config);

            if(typeof callback === "function"){
                callback(err, config);
            }
            

        })

    },

    getConfig: function(callback) {

        config = {

            "address": this.address,

            "type": this.type,

            "name": this.name,

            "desc": this.desc,

            "emitInterval": this.emitInterval

        }

        callback(null, config);

    },

    readSensor: function(callback) {
        
        var self = this;
        
        var cmd = "cat " + this.path + " | grep t= | cut -f2 -d= | awk '{print $1/1000}'";

        exec(cmd, function(error, stdout, stderr) {

            if (error) {
                callback(error);
                console.log("error reading w1 file");
            }
            
            var temp = Math.round((parseFloat(stdout) * 1.8 + 32) * 10) / 10;
            
            callback(null, temp);

        });

    },

    $statics: {

        actions: {

            subscribe: function(socket, device, args) {

                device.events.on("tempChange", function(data) {

                    socket.emit("tempSensorData", data);

                });

                device.events.on("configChange", function(config) {

                    socket.emit("tempSensorConfig", config);

                });

            },

            updateConfig: function(socket, device, args) {

                device.updateConfig(args, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            getConfig: function(socket, device, args) {

                device.getConfig(function(err, config) {

                    (err) && socket.emit("alert", err);

                    socket.emit("tempSensorConfig", config);

                })

            },

            readSensor: function(socket, device, args) {

                device.readSensor(function(err, temp) {

                    (err) && socket.emit("alert", err);

                    socket.emit("tempSensorData", {
                        name: device.name,
                        temp: temp,
                        timestamp: Date().toJSON()
                    });

                })

            }

        }

    }

});

module.exports = TempSensor;