/*
 *Helpers for various tasks
 */


 //Dependancies
 var crypto = require('crypto');
 var config = require('./config');



 //container for all the helpers
var helpers = {};

//function for hashing password by creating SHA256 hash, accepts string and returns a hash
helpers.hash = function(str){          //returns a hash without calling it back, hence no callback

    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else{
        return false;
    }
}

//function which takes in arbitrary string and either returns json object from it or false ie error
helpers.parseJsonToObject = function(str) {         //Parse a json string to object in all cases without throwing

    try{
        var obj = JSON.parse(str);
        return obj;
    }
    catch(err){
        return {};
    }
};







//Export the module
module.exports = helpers;