Brewbone System Notes
=====================

The Brewbone is a brewery management system based on the beaglebone black computing board. This is a work in progress, but has the basic functionality. In its current state, everything is manuall controlled, but in the future it is hoped some automation functionality will be added. 

#Programming

## Architecture
I need to figure out how to architect this application. I think the bare bones are as follows:

- __Hardware__ : these modules will interface with the hardware via bonescript. This package should only be use to control the io to and from the hardware.
	- Inputs
		- Temp probes
			- 28-000004b27a00 - on pi board
			- 28-000003f4db27 - MLT
			- 28-000003f4efc3 - RIMS
		- Flowmeter
	- Outputs
		- PWM
			- Max\Min Power
		- Standard On-Off
			- Max\Min Duration
		-Safety Control
			- Use other inputs to determine if the output can be safely used (ie, water must be flowing to turn on a heating element to avoid burning it up).
	- Assemblies
		- A combination of inputs and outputs whereby the inputs can control the outputs when the assembly is activated
		- PID Controller
		- Pump Assembly
	- _Need to figure out pinmuxing to write a cap to open access for all gpio pins_
- __View (UI)__ : This is the html user interface which will be served to the client in order to control the brewing system and pull up the brewing history
	- To start this is going to be a simple interface to only interact with and control the RIMS funcionality. No data will be saved post session
- __Controller__ : This will be the middleman which will translate and inputs and outputs between the hardware and ui.
	- Socket.io : the controller will contain all of the logic for the realtime io of the data from the hardware to the ui and vice versa
		- _How do I organize and factor this to scale with the hardware? I dont want to hand code each hardware element._
		- [Seperateing file server and socket.io logic in node.js](http://stackoverflow.com/questions/9709912/separating-file-server-and-socket-io-logic-in-node-js)
	- When storage is implemented, this will need to also log data as it comes in
- __Model__ - This will be used to save and store data
	- _Use CouchDB?_
	- Store and save system config data
	- Store and save batch data
	- Store recipes

## Application Startup
This sections discusses how the brewbone application needs to start.

- Apply cape/pinmux settings
- Start W1 devices
	-[From Hipster Circuits](http://hipstercircuits.com/dallas-one-wire-temperature-reading-on-beaglebone-black-with-dto/)
		echo BB-W1:00A0 > /sys/devices/bone_capemgr.9/slots
- Load components and build assemblies from config
- Start server, listen to port for client calls

## Socket.io  <--> Hardware Communication

### Socket.io Configuration
	var brewbone = require("brewbone");

	// server code

	io.sockets.on("connection",function(socket){
		socket.on("hardware",function(data, socket)
			data.devices.forEach(function(d, socket){
				d.components.forEach(function(c, socket){
					brewbone[d.name].getByName(c.name).actions[c.action](socket);
				});
			});
		);
		socket.emit("brewbone", {
			"type":"system",
			"name":"state",
			"data":[] //system state data to initialize clien to current syste, state.  
		}
	});

#### Data Structure Client -> Brewbone
	data = {
		"devices": [{
			"name" : "device_type_name", // temp_sensors, flowmeters, PIDs, etc
			"components" : [
				{
					"name": "Component_Name", // rims, mlt, sys, etc
					"action": "desired_action" // subscribe, on, off, set_power, etc
				}
			]
		}]
	}
	
#### Data Structure Brewbone -> Client
Data will be sent to the client in the following format:

	data = {
		"type":"type", //ie, temp_sensor, flowmeter, alert, etc.
		"name": "name", // ie. rims, mlt, warning, error, etc.
		"data": [ // temp_sensor example
			{"name":"temp","value":"152.0"},
			{"name":"timestamp","value":"datetime_as_json"}
			]
		}

##### Client Controller.js
The client will implement a controller which will interpret the incoming data from the brewbone and handle it correctly. it will route the passed in data to a controller node based on the _type_ of data. that node will resond accordingly. 

	socket.on("brewbone", function(brewbone){
		controller[brewbone.type](brewbone);
	}
	
	controller["temp_sensor"] = function(brewbone){
		brewbone.data.forEach(d){
			var dom = data.type + data.name + d.name;
			$(dom).text = d.value;
		}
		
	}

the typical data display has an id of type_name_dataname. this way the controller can string together the passed in data and use this interface to updat the DOM. Exceptions are data events such as on/off events and system alerts. each _type_ will have its own actions which is based on the standard interface as outlined above. 


#### Brewbone Component Actions
	var actions = {};

	actions["action_name"] = function(socket) {
		// do something
		socket.emit("hardware", something);
	};

##Stack Overflow Question
I am new to node.js / bonescript / socket.io, so I am having a bit of a block in trying to figure out how to organize my logic/code. I am using a beaglebone black (bbb) to automate some of my homebrewing steps and am going to use node.js/socket.io to allow me to control it from a webpage served by the bbb. This is what I have so far:

- Hardware layer : I have written module for the different hardware components to allow them to be turned on/off, and for data to be read from them (temp from temp sensors, etc).

- Controller Layer : this will receive requests from the web-app and translate them into actions/responses from the server.

 - Socket.io - the mechanism for interacting between the client and the hardware

- Web-App - the front-end ui.

How do I integrate my socket.io logic? I need to allow each component to be controlled. Do I need to hard-code the io logic for each component, or is there a way to abstract it out? If I can abstract it, do I need to (or can I) put the io code in with the hardware modules, or seperate it out somehow.