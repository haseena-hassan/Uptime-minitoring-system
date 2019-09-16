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
//Required data : phone (which users data that u wanna access)
//Optional data : none
// @TODO only let an authenticated user access their data object and dont let anyone else       done!
handlers._users.get = function(data, callback){         //here 'data' is not the one coming in but that data from the .read function fetched 

    //check that phone number is valid
    var phone  = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

        //Get the token from the headers        -----------validating starts here, verifies that u are u----
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        //Verify that given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid){

            if(tokenIsValid){
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
                callback(403, {'Error' : 'Missing required token in header or token is invalid'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required field'});
    }
};



//Users - put
//required data : phone (which user u wanna update)
//optional data : firstName, lastName, password (atleast one must be specified)
// @TODO only let an authenticated user update their own object, and dont let them update anyone else
handlers._users.put = function(data, callback){
    
    //Check for the required field
    var phone  = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    //Check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   
    //Check whether is phone is valid
    if(phone){

        //Check whether any of the optional field is sent to update
        if(firstName || lastName || password){

            //Get the token from the headers        -----------validating starts here, verifies that u are u----
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            //Verify that given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid){

                if(tokenIsValid){

                    //Lookup the user
                    _data.read('users', phone, function(err, userData){

                        if(!err && userData){

                            //Update the necessary fields
                            if(firstName){
                                userData['firstName'] = firstName;
                            }
                            if(lastName){
                                userData['lastName'] = lastName;
                            }
                            if(password){
                                userData['password'] = helpers.hash(password);
                            }

                            //Store the updated data 
                            _data.update('users', phone, userData, function(err){

                                if(!err){
                                    callback(200);      //tell user that everything was successful
                                }
                                else{
                                    console.log(err);
                                    callback(500, {'Error' : 'Could not update the user'});     //some internal error
                                }
                            })
                        }
                        else{
                            callback(400, {'Error' : 'The specified user does not exist'});     //can also use 404, but not preferred in put
                        }
                    });
                }
                else{
                    callback(403, {'Error' : 'Missing required token in header or token is invalid'});
                }
            });
        }
        else{
            callback(400, {'Error' : 'Missing required fields'});
        }
    }
    else{
        callback(400, {'Error' : 'Missing required fields'});
    }
};




//Users - delete
//Required data : phone
// @TODO only let an authenticated user delete their own data objects. dont let them delete anyone else's
// @TODO Cleanup (delete) any other data associated with this user 
handlers._users.delete = function(data, callback){

    //check that phone number is valid
    var phone  = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

        //Get the token from the headers        -----------validating starts here, verifies that u are u----
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        //Verify that given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid){

            if(tokenIsValid){
                //lookup the user
                _data.read('users', phone, function(err, data){
                    if(!err && data){

                        //Deleting the data from the user collection
                        _data.delete('users', phone, function(err){

                            if(!err){
                                callback(200);
                            }
                            else{
                                callback(500, {'Error' : 'Could not delete the specified user'});
                            }
                        });
                    }
                    else{
                        callback(400, {'Error' : 'Could not find the specified user'});  //not found status
                    }
                });
            }
            else{
                callback(403, {'Error' : 'Missing required token in header or token is invalid'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required field'});
    }
};







//Tokens handler
handlers.tokens = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];        //this method actually figure out which method u r requesting,acceptable methods and pass it along some sub handlers
    if(acceptableMethods.indexOf(data.method) > -1) {                //if data method exists within the acceptable methods array
        handlers._tokens[data.method](data, callback);               //pass to the subhandler for that specific request method, _user private handler named so by convention(yet need to define)
    }   
    else{
        callback(405);      //http status code for method not found
    }
};


//Containers for all the tokens method
handlers._tokens = {};

//Tokens - post
//Required data : phone, password :creating token requires initial auth, later token can be used
//Optional data : none
handlers._tokens.post = function(data, callback){

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){

        //Lookup the user who matches the phone number
        _data.read('users', phone, function(err, userData){

            if(!err && userData){

                //Check the password send against the hashed password, so first we need to hash the obtained password
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData['password']){

                    //if valid create a new token with a random name, set the expiration date 1 hour in future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000*60*60 ;

                    var tokenObject = {
                        'phone' : phone,
                        'tokenId' : tokenId,
                        'expires' : expires
                    }

                    //Store the token
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200, tokenObject);
                        }
                        else{
                            callback(500, {'Error' : 'Could not create the new token'});
                        }
                    });
                }
                else{
                    callback(400, {'Error' : 'Password didnt match the specified user\'s stored password'});
                }
            }
            else{
                callback(400, {'Error' : 'Could not find the specified user'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required fields'});
    }
};

//Tokens - get
//Required data: id
//Optional data: none
handlers._tokens.get = function(data, callback){

    //Check whether the id is valid
    var id  = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){

        //lookup the token
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){

                callback(200, tokenData);
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

//Tokens - put
//Required data : id, extends
//Optional data : none
handlers._tokens.put = function(data, callback){

    //Check whether id is valid and extend request is true
    var id  = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend  = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend){

        //Look up the token
        _data.read('tokens', id, function(err, tokenData){

            if(!err && tokenData){

                //Check to make sure that the token isn't expired
                if(tokenData['expires'] > Date.now()){

                    //Set the expiration an hour from now
                    tokenData['expires'] = Date.now() + 1000*60*60;

                    //Store the updated expiry time
                    _data.update('tokens', id, tokenData, function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            callback(500, {'Error' : 'Could not update the token\'s expiration'});
                        }
                    });
                }
                else{
                    callback(400, {'Error' : 'Token had already expired and cannot be extended'});
                }
            }
            else{
                callback(400, {'Error' : 'Specified token didnt exist'});
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
    }
};

//Tokens - delete (deleting a token is logging out basically)
//Required data: id
//Optional data : none
handlers._tokens.delete = function(data, callback){

    //Check whether the id is valid
    var id  = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){

        //lookup the token
        _data.read('tokens', id, function(err, data){
            if(!err && data){

                //Deleting the data from the user collection
                _data.delete('tokens', id, function(err){

                    if(!err){
                        callback(200);
                    }
                    else{
                        callback(500, {'Error' : 'Could not delete the specified token'});
                    }
                });
            }
            else{
                callback(400, {'Error' : 'Could not find the specified token'});  //not found status
            }
        });
    }
    else{
        callback(400, {'Error' : 'Missing required field'});
    }
};

//Verify a given tokenID is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback){

    //Lookup the token
    _data.read('tokens', id, function(err, tokenData){
        if(!err && tokenData){

            //Check that the token is for the given user and has not expired
            if(tokenData['phone'] == phone && tokenData['expires'] > Date.now()){
                callback(true)
            }
            else{
                callback(false)
            }
        }
        else{
            callback(false);
        }
    });
}





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