/*
 * Request handlers
 */


 //Dependencies
 var _data = require('./data');
 var helpers = require('./helpers');

 // Define all the handlers
var handlers = {};

//Users handler
handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];        //this method actually figure out which method u r requesting,acceptable methods and pass it along some sub handlers
    if(acceptableMethods.indexOf(data.method) > -1) {    //if data method exists within the acceptable methods array
        handlers._users[data.method](data, callback);    //pass to the subhandler for that specific request method, _user private handler named so by convention(yet need to define)
    }   
    else{
        callback(405);      //http status code for method not found
    }
};

//Containers for the users sub methods, we create the subhandler to be a object and further defines method members for each of the accepable methods
handlers._users = {}

//Users - post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data: none
handlers._users.post = function(data, callback){

    //check if the user gave the payload in the structure that we  required, if didnt sent back an err
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){

        //Make sure that the user didnt already exist
        _data.read('users',phone,function(err,  data){

            if(err){

                //Hash the password before storing it as such
                var hashedPassword = helpers.hash(password);

                //check to make sure hashing worked correctly
                if(hashedPassword){

                    //Create the user object
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'password' : hashedPassword,
                        'tosAgreement' : true
                    };
    
                    //Store the user data to disk
                    _data.create('users', phone, userObject, function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            console.log(err);
                            callback(500, {'Error' : 'Could not create the new user'});
                        }
                    });
                }
                else{
                    callback(500, {'Error' : 'Could not hash the user\'s password'});
                }
            }
            else{
                callback(400, {'Error' : 'User with that phone already exist'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing requires fields'});
    }
};

//Users - get
//Required data : phone
//Optional data : none
// @TODO only let an authenticated user access their data object and dont let anyone else
handlers._users.get = function(data, callback){         //here 'data' is not the one coming in but that data from the .read function fetched 

    //check that phone number is valid
    var phone  = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

        //lookup the user
        _data.read('users', phone, function(err, data){
            if(!err && data){

                //Remove the hashed password from the user object before returning it to the requester
                delete data['password'];
                callback(200,data);
            }
            else{
                callback(404);  //not found status
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required field'});
    }
};

//Users - put
handlers._users.put = function(data, callback){

};

//Users - delete
handlers._users.delete = function(data, callback){

};

// Ping handler
handlers.ping = function(data,callback){
    callback(200);
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};

//Export the module
module.exports = handlers;