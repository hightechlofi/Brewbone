function test_enum_func(config){
    this.type = config.type;
}

test_enum_func.prototype.func = function(callback){
    var self = this;
   this._supported.filter(function(item,index,array){
        return (item.name === self.type)
    })[0].func(callback);
};

test_enum_func.prototype._supported = [
        {
            "name":"type1",   
            "func": function(callback){
                callback("type1 func called");
            }
        },
        {
            "name":"type2",   
            "func": function(callback){
                callback("type2 func called");
            }
        }
];

test_enum_func.prototype.isSupported = function(type){
   if(this._supported.filter(function(item,index,array){
        return (item.name === type);
    }).length >0){return true;}else{return false;}
};

var test1 = new test_enum_func({"type": "type2"});

console.log(test1.type);
console.log(test1.isSupported(test1.type));