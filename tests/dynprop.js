module.exports = factory;
var config = {
	"name":"testobj",
	"prop":"testprop"
};

function factory(config){
	obj = new Object();
	for(var p in config){
		obj[p] = config[p];
	}
	return obj;
}

var o = factory(config);

console.log(o);