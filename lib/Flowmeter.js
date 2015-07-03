var jsface = require("jsface"),
    Class  = jsface.Class,
    extend = jsface.extend,
    b = require("bonescript"),
    util = require("util"),
	  lucidjs = require("lucidjs");
    


var Flowmeter = Class({

  constructor: function(opts, callback) {

    this.events = new lucidjs.EventEmitter();
  
    this.updateConfig(opts);

    this.flowrate = 0;

    this.totalizerVol = 0;
    
    this.pulseCount = 0;
    
    this.pulsePrevious = 0;
    
    this.pulseTotalizer = 0;

    this.totalize = false;
    
    this.isFlowing = false;

    this.emitInterval = "";
    
    b.pinMode(this.pin, b.INPUT);
    
    b.attachInterrupt(this.pin,true,b.FALLING,this.pulse, function(x){
         console.log("Flowmeter attachInterrupt called for pin: " + this.pin);
    });    
    
    
  },

  updateConfig: function(opts, callback) {
  
    this.pin = opts.pin;
    
    this.name = opts.name;
    
    this.desc = opts.desc;
    
    this.type = opts.type;
      
    var self = this;
      
    this.getConfig(function (err, config) {
      
      if(typeof callback === "function"){
        callback(err, config);
      }
      
      self.events.emit("updateConfig", config);

      });
    
  },
  
  getConfig: function (callback) {
    
    var config = {
      
      "pin": this.pin,
      
      "name": this.name,
      
      "desc": this.desc,
      
      "type": this.type
      
    };
    
    callback(null, config);
    
  },
  
  pulse: function () {

    this.pulseCount++;

    if(this.totalize){
      this.pulseTotalizer++;
    }

    if(!this.isFlowing){
      this.isFlowing = true;
      //this.emitData();
    }
    
  },
  
  startTotalizer: function (callback) {
    this.pulseTotalizer = 0;
    this.totalize = true;

    if(typeof callback === "function"){
      callback(null);
    }
  },
  
  stopTotalizer: function (callback) {
    this.totalize = false;

    if(typeof callback === "function"){
      callback(null);
    }
  },
  
  getTotalizer: function (callback) {

    var vol = this.getVolume[this.type]();

    if(typeof callback === "function"){
      callback(null, vol);
    }
    
  },

  emitData: function(){

    var self = this;
    this.emitInterval = setInterval(function(){
      //get current flowrate
      self.flowrate = self.getFlowrate[this.type]();
      //get totalizer
      if(self.totalize){
        self.totalizerVol = self.getVolume[this.type]();
      }

     var data = {
          "name": self.name,
          "flowrate": self.flowrate,
          "volume": self.totalizerVol
        }

      self.events.emit("flowrate",data);
      if(self.pulsePrevious === self.pulseCount){
        self.isFlowing = false;
        clearInterval(self.emitInterval);
      }
      self.pulsePrevious = self.pulseCount;

    },1000)
  },
  
  $statics: {
  
    getFlowrate: {
    
      ADA828: function () {

        var p = self.pulseCount;

        var interval = 500;

        var self = this;

        setTimeout(function(){
          p = self.pulseCount - p;
          hertz = p/(interval/1000);
          lpm = hertz/7.5;
          gpm = lpm *.264172;
          return gpm

        }, 500)
        
      },
      
      ADA833: function () {
        
        var p = self.pulseCount;

        var interval = 500;

        var self = this;

        setTimeout(function(){
          p = self.pulseCount - p;
          hertz = p / (interval / 1000);
          lpm = hertz / 8.1;
          lpm -= 6;
          gpm = lpm * .264172;
          return gpm;

        }, 500)
      }
      
    },
    
    getVolume: {
    
      ADA828: function () {
        liters = this.pulseTotalizer / 450;
        gal = liters * .264172;
        return gal;
      },
      
      ADA833: function () {
        liters = this.pulseTotalizer / 485;
        gal = liters * .264172;
        return gal;
      }
      
    },
  
    actions: {
    
      subscribe: function(socket, device, args){
        device.events.on("updateConfig", function(config){
          socket.emit("flowmeterConfig", config)
        })

        device.events.on("flowrate", function(data){
          socket.emit("flowmeterData",data);
        })
      },
      
      startTotalizer: function(socket, device, args){
        device.startTotalizer(function(err) {
          (err) && socket.emit("alert", err);
        })
      },
      
      stopTotalizer: function(socket, device, args){
        device.stopTotalizer(function(err) {
          (err) && socket.emit("alert", err);
        })
      },
      
      getTotalizer: function(socket, device, args){
        device.getTotalizer(args.value, function(err, totalizer) {
          data = {
            name: device.name,
            volume: totalizer
          }
          socket.emit("flowmeterTotalizer", data);
        })
      },
      
      updateConfig: function(socket, device, args){
        device.updateConfig(args, function(err) {
          (err) && socket.emit("alert", err);
        })
      },
      
      getConfig: function(socket, device, args){
        device.getConfig(function(err, config) {
          socket.emit("flowmeterConfig", config);
        })
      }
      
    }
    
  }

});

module.exports = Flowmeter;