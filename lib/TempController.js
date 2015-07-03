var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs"),
    Pid = require("./Pid");


var TempController = Class({

    constructor: function(config, brewbone, callback) {

        this.events = new lucidjs.EventEmitter();

        // initialize local vaiables
        this.pid = new Pid();
        this.input = brewbone.hardware["tempSensors"].get(config.input);
        this.output = brewbone.hardware["outputs"].get(config.output);
        this.state = false;
        this.power = 0;
        this.startTime = 0;
        this.tempTarget = 152;
        this.pidInterval = "";
        this.temp = 0;
        this.sampleTime = 1000;
        var self = this;
        this.input.readSensor(function(err, temp) {
            self.temp = temp
        })
        this.input.events.on("tempChange", function(data) {
            self.temp = data.temp;
            console.log("temp_controller: temperature updated from sensor = " + self.temp);
            self.state && self.setPid;
            if (self.state) {
                self.getData(function(err,data) {
                    self.events.emit("tempControllerData", data);
                });
            };
        })

        this.updateConfig(config, function(err) {

            if (callback !== undefined) {
                callback(err)
            };

        });

    },

    updateConfig: function(config, callback) {

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

                self.events.emit("configChange", config);

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

            "input": this.input.name

        };

        callback(null, config);

    },


    getData: function(callback) {

        // returns genral temp controller data
        if (this.startTime > 0){
            var duration = new Date().getTime();
            var dur = Math.floor((duration - this.startTime) / 1000);
            var days = Math.floor(dur / 86400);
            dur -= days * 86400;
            var hours = Math.floor(dur / 3600) % 24;
            dur -= hours * 3600;
            var minutes = Math.floor(dur / 60) % 60;
            dur -= minutes * 60;
            var seconds = dur % 60;
            
            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            
            var curDuration = "";
            if (days >0) {curDuration = days + ':'};
            curDuration += hours+':'+minutes+':'+seconds;
            
        } else {
            var curDuration = "00:00:00";
        }

        var data = {

            "name": this.name,

            "state": this.state,

            "power": this.power,

            "temp": this.temp,

            "setpoint": this.tempTarget,

            "duration": curDuration,

            "startTime": this.startTime

        }

        callback(null, data);

    },

    setState: function(state, callback) {
        this.state = state;
        this.pid.inAuto = state;
        this.output.state = state;
        if (state) {
            this.startTime = new Date().getTime();
            var self = this;
            this.pidInterval = setInterval(function() {
                self.setPid();
            }, this.sampleTime);
        } else {
            clearInterval(this.pidInterval);
            this.power = 0;
            this.startTime = 0;
            this.output.setState(false);
        };

        var self = this;

        this.getData(function(err, data) {
            self.events.emit("stateChange", data);
        })

        if (callback !== undefined) {
            callback(null, this.state)
        };

    },

    setTarget: function(setPoint, callback) {

        this.tempTarget = setPoint;

        var self = this;

        this.getData(function(err, data) {
            self.events.emit("targetChange", data);
        })

        if (callback !== undefined) {
            callback(null, this.tempTarget)
        };

    },

    setPid: function() {
        
        console.log("setting pid");

        this.pid.setTarget(this.tempTarget);

        var prevPower = this.power;

        var self = this;
        console.log("calling pid update");
        this.pid.update(self.temp, function(err, power) {
            console.log("updating pid power to: " + power);
            self.power = power;
            self.output.setPower(self.power);
  
                self.getData(function(err, data) {
                    self.events.emit("tempControllerData", data);
                });

        });

    },


    $statics: {

        actions: {

            subscribe: function(socket, tempController, args) {

                // initialize client with tempController data and config

                tempController.getData(function(err, data) {

                    socket.emit("tempControllerData", data);

                })

                tempController.getConfig(function(err, config) {

                    socket.emit("tempControllerConfig", config);

                })

                // subscribe to tempController events

                tempController.events.on("tempControllerData", function(data) {

                    socket.emit("tempControllerData", data);

                })

                tempController.events.on("stateChange", function(data) {

                    socket.emit("tempControllerData", data);

                })

                tempController.events.on("targetChange", function(data) {

                    socket.emit("tempControllerData", data);

                })

                tempController.events.on("configChange", function(config) {

                    socket.emit("tempControllerConfig", config);

                })

            },

            updateConfig: function(socket, tempController, args) {

                tempController.updateConfig(args, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            getConfig: function(socket, tempController, args) {

                tempController.getConfig(function(err, config) {

                    socket.emit("tempControllerConfig", config);

                })

            },

            state: function(socket, tempController, args) {

                tempController.setState(args, function(err, data) {

                    socket.emit("tempControllerData", data);

                })

            },

            setpoint: function(socket, tempController, args) {

                tempController.setTarget(args, function(err, data) {

                    socket.emit("tempControllerData", data);

                })

            },

        }

    }

});

module.exports = TempController;
