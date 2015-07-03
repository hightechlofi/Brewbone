
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Brewbone = require("./lib/brewbone");
var Config = require("./lib/Config");

var app = express();

var brewbone = new Brewbone();

// all environments
app.set('port', 8090);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

console.log("server running on port: " + app.get('port'))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);
var io = require("socket.io").listen(server);
// io.set('transports',['xhr-polling']);

app.get('/', routes.index);
app.get('/users', user.list); 



/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/
server.listen(app.get('port'));

io.sockets.on("connection", function(socket){
	console.log("socket connection initiated.")
	//socket.emit("initialize", brewbone.state);
	
	socket.on("action",function(action){
				console.log("Received Action:\nDevice: " + action.deviceType + "\nName: " + action.name + "\nAction: " + action.action + "\n" + action + "\nValue: " + action.value);
				var component = brewbone.hardware[action.deviceType + "s"].get(action.name)
				component.actions[action.action](socket, component, action.value);
	});	
})
