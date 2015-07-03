var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs");


var Pid = Class({

    constructor: function(config, callback) {

        this.events = new lucidjs.EventEmitter();

        // Set defaults

        this.kp = 1;
        this.ki = 0;
        this.kd = 0;
        this.outMin = 0;
        this.outMax = 1;
        this.controllerDirection = true;
        this.inAuto = false;
        this.sampleTime = 1000;
        this.setPoint = 0;

        // Apply supplied configuration

        if(typeof config != "undefined"){       

            this.updateConfig(config, function(err) {

                if (callback !== undefined) {
                    callback(err)
                };

            });
        }

        // Initialze local variables

        this.sumError = 0;
        this.lastInput = 0;
        this.lastTime = 0;
        this.iTerm = 0;
        this.Output = 0;
        this.current_value = 0;

    },

    updateConfig: function(config, callback) {

        console.log("updating config");

        //verify tuning arguments
        var tunings = true;
        if (config.kp === undefined || !config.kp) {
            tunings = false;
        };

        if (config.ki === undefined || !config.ki) {
            tunings = false;
        };

        if (config.kd === undefined || !config.kd) {
            tunings = false;
        };

        if (tunings) {
            this.setTuning(config.kp, config.ki, config.kd)
        };

        // verify output limits

        var outLimits = true;

        if (config.outMin === undefined || !config.outMin) {
            outLimits = false;
        };

        if (config.outMax === undefined || !config.outMax) {
            outLimits = false;
        };

        if (outLimits) {
            this.setOutputLimits(config.outMin, config.outMax)
        };

        if (config.controllerDirection !== undefined) {
            this.setControllerDirection(config.controllerDirection);
        };

        if (config.inAuto !== undefined) {
            this.setMode(config.inAuto);
        };

        if (config.sampleTime !== undefined && config.sampleTime) {
            this.setSampleTime(config.sampleTime);
        };

        if (config.setPoint !== undefined && config.setPoint) {
            this.setTarget(config.setPoint);
        };

        self = this;

        this.getConfig(function(err, config) {

                self.events.emit("configChange", config);

                if (callback !== undefined) {
                    callback(null, config)
                };

            }

        );

    },

    setTarget: function(setPoint, callback) {

        this.setPoint = setPoint;

        self = this;

        this.getConfig(function(err, config) {

                self.events.emit("targetChange", config);

                if (callback !== undefined) {
                    callback(null, config)
                };

            }

        );
    },

    setTuning: function(Kp, Ki, Kd) {
        if (Kp < 0 || Ki < 0 || Kd < 0) {
            return
        };

        var SampleTimeInSec = this.sampleTime / 1000;
        this.kp = Kp;
        this.ki = Ki * SampleTimeInSec;
        this.kd = Kd / SampleTimeInSec;

        if (!this.controllerDirection) {
            this.kp = (0 - this.kp);
            this.ki = (0 - this.ki);
            this.kd = (0 - this.kd);
        }

    },

    setSampleTime: function(newSampleTime) {
        if (NewSampleTime > 0) {
            var ratio = newSampleTime / this.sampleTime;
            this.ki *= ratio;
            this.kd /= ratio;
            this.sampleTime = newSampleTime;
        }

    },

    setOutputLimits: function(Min, Max) {
        if (Min > Max) return;
        this.outMin = Min;
        this.outMax = Max;

        if (this.output > this.outMax) {
            this.output = this.outMax;
        } else if (this.output < this.outMin) {
            this.output = this.outMin;
        }

        if (this.iTerm > this.outMax) {
            this.iTerm = this.outMax;
        } else if (this.iTerm < this.outMin) {
            this.iTerm = this.outMin;
        }

    },

    setMode: function(Mode, callback) {
        var newAuto = Mode;
        if (newAuto == !this.inAuto) { //we just went from manual to auto
            this.initialize();
        }
        this.inAuto = newAuto;

        self = this;

        this.getConfig(function(err, config) {

                self.events.emit("modeChange", config);

                if (callback !== undefined) {
                    callback(null, config)
                };

            }

        );

    },

    setControllerDirection: function(Direction) {
        this.controllerDirection = Direction;

    },

    getConfig: function(callback) {

        var config = {

            "kp": this.kp,

            "ki": this.ki,

            "kd": this.kd,

            "outMin": this.outMin,

            "outMax": this.outMax,

            "controllerDirection": this.controllerDirection,

            "inAuto": this.inAuto,

            "sampleTime": this.sampleTime,

            "setPoint": this.setPoint

        };

        callback(null, config);

    },

    getData: function(callback) {

        // returns genral pump data

        var data = {

            "sumError": this.sumError,

            "lastInput": this.lastInput,

            "lastTime": this.lastTime,

            "iTerm": this.iTerm,

            "setPoint": this.setPoint,

            "sampleTime": this.sampleTime,

            "inAuto": this.inAuto

        }

        callback(null, data);

    },

    update: function(current_value, callback) {
        if (!this.inAuto) {
            return
        };
        var now = Date.now();
        var timeChange = (now - this.lastTime);
        if (timeChange >= this.sampleTime) {
            //Compute all the working error variables
            this.current_value = current_value;
            var error = this.setPoint - this.current_value;
            this.iTerm += (this.ki * error);
            if (this.iTerm > this.outMax) {
                this.iTerm = this.outMax;
            } else if (this.iTerm < this.outMin) {
                this.iTerm = this.outMin;
            }
            var dInput = (this.current_value - this.lastInput);

            //Compute PID Output
            var Output = this.kp * error + this.iTerm - this.kd * dInput;

            if (Output > this.outMax) Output = this.outMax;
            else if (Output < this.outMin) Output = this.outMin;
            this.Output = Output;

            //Remember some variables for next time
            this.lastInput = this.current_value;
            this.lastTime = now;

            callback(null, this.Output);
        }

    },

    initialize: function() {
        this.lastInput = this.current_input;
        this.ITerm = this.Output;
        if (this.ITerm > this.outMax) {
            this.ITerm = outMax;
        } else if (this.ITerm < this.outMin) {
            this.ITerm = this.outMin;
        }
    }

});

module.exports = Pid;
