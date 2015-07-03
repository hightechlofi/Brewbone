var jsface = require("jsface"),
    Class = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
    lucidjs = require("lucidjs");


var Output = Class({

    constructor: function(config, callback) {

        this.events = new lucidjs.EventEmitter();

        this.updateConfig(config, function(err) {

            if (callback !== undefined) {
                callback(err)
            };

        });

        this.power = 0;

        this.state = false;

    },

    updateConfig: function(config, callback) {

      console.log("updating config: " + config.name);
      console.log("config isPwm: " + config.isPwm)

        if (config.name === undefined || !config.name) {
            config.name = this.name
        };
        this.name = config.name;

        if (config.desc === undefined || !config.desc) {
            config.desc = this.desc
        };
        this.desc = config.desc;

        if (config.pin === undefined || !config.pin) {
            config.pin = this.pin
        };
        this.pin = config.pin;

        if (config.isPwm === undefined) {
            config.isPwm = this.isPwm
        };
        this.isPwm = config.isPwm;

        if (config.minOutput === undefined) {
            config.minOutput = this.minOutput
        };
        this.minOutput = config.minOutput;

        if (config.maxOutput === undefined || !config.maxOutput) {
            config.maxOutput = this.maxOutput
        };
        this.maxOutput = config.maxOutput;

        if(this.isPwm){
            b.pinMode(this.pin, b.ANALOG_OUTPUT,2000)
        } else {
            b.pinMode(this.pin, b.OUTPUT,7);
        }

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

            "pin": this.pin,

            "name": this.name,

            "desc": this.desc,

            "isPwm": this.isPwm,

            "minOutput": this.minOutput,

            "maxOutput": this.maxOutput

        };

        callback(null, config);

    },

    setPower: function(power, callback) {
        console.log("setting output power");
        if(power > 1){power = power / 100};

        if(power > this.maxOutput){power = this.maxOutput};
        if(power < this.minOutput){power = this.minOutput};
        // Verify incoming power argument is valid, if so update the power property
       /* if (this.minOutput <= power && power <= this.maxOutput) {
            this.power = power;
        } else {
            return callback(new Error("Output- Invalid power argument:" + power));
        };*/
        this.power = power;
        // if the output is pwm and the device is on, write the new power to the output
        if(this.isPwm && this.state){
             b.analogWrite(this.pin, this.power);
         }

        // Emit a powerChange event

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

        this.state = state;

        //Control the device accordingly
        if (!state) {

            // turn the device off if state is false
            if(this.isPwm){
              b.analogWrite(this.pin,0)
            } else {
              b.digitalWrite(this.pin, b.LOW, function(err) {
                  (typeof err !== "boolean") && callback("digialWrite Off Error : " +  err)
              })
            }
            
        } else {
            console.log("isPwm: " + this.isPwm);
            // otherwise check to see if this is a pwm output
            if(this.isPwm){

                // turn the pwm device on to the current power
                console.log("analogWrite on " + this.pin + " to " + this.power);
                b.analogWrite(this.pin, this.power)

                // turn the digital device on
                }else{
                 b.digitalWrite(this.pin, b.HIGH, function(err) {
                    console.log("outout digitalWrite");
                    (typeof err !== "boolean") && callback("digitalWrite On Error : " + err)
                });
             }
        }

        // emit a stateChange event with the current output setting data

        that = this;

        this.getData(function(err, data) {

            that.events.emit("stateChange", data);

        });

        if (callback !== undefined) {
            callback(null, this.state)
        };
    },

    getData: function(callback) {

        // returns genral pump data

        var data = {

            "name": this.name,

            "state": this.state,

            "power": this.power

        }

        callback(null, data);

    },


    $statics: {

        actions: {

            subscribe: function(socket, output, args) {

                // initialize client with output data and config

                output.getData(function(err, data) {

                    socket.emit("outputData", data);

                })

                output.getConfig(function(err, config) {

                    socket.emit("outputConfig", config);

                })

                // subscribe to output events

                output.events.on("stateChange", function(data) {

                    socket.emit("outputData", data);

                })

                output.events.on("powerChange", function(data) {

                    socket.emit("outputData", data);

                })

                output.events.on("configChange", function(config) {

                    socket.emit("outputConfig", config);

                })

            },

            state: function(socket, output, args) {

                output.setState(args, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            power: function(socket, output, args) {

                output.setPower(args, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            updateConfig: function(socket, output, args) {

                output.updateConfig(args, function(err) {

                    (err) && socket.emit("alert", err);

                })

            },

            getConfig: function(socket, output, args) {

                output.getConfig(function(err, config) {

                    socket.emit("outputConfig", config);

                })

            }

        }

    }

});

module.exports = Output;
