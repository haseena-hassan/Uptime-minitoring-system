//Library for creating and editing data

//Dependancies
var fs = require('fs');
var path = require('path');     //te normalise the paths btw diff directories

//Create container for this module (to be exported)
var lib = {};

//Base directory for the .data folder
lib.baseDir = path.join(__dirname, '/../.data/')    // directoryOfCurrentFile/../.data/ : cleaned path

//Function to write data to a file
lib.create = function(dir, file, data, callback){

    var fileToCreate = lib.baseDir + dir + '/' + file + '.json';      //  cleanedPath/ test / newfile . json
    
    //open the file for writing
    fs.open(fileToCreate, 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){

            //convert json object data to string
            var stringData = JSON.stringify(data);

            //write to file 
            fs.writeFile(fileDescriptor, stringData, function(err){

                if(!err){

                    //Close the file
                    fs.close(fileDescriptor, function(err){

                        if(!err){
                            callback(false);    //implies everything worked well without any errors
                        }
                        else{
                            callback('Error closing new file ');
                        }
                    });
                }
                else{
                    callback('Error writing to new file ');
                }
            });
        }
        else{
            callback('Error creating new file, it may already exist');
        }
    });
}


//Function to read data from a file
lib.read = function(dir, file, callback){
    
    var fileToRead = lib.baseDir + dir + '/' + file + '.json';
    
    fs.readFile(fileToRead, 'utf8', function(err,data){     //read file
        
        callback(err,data);
    });
};




//Function to update data in a file
lib.update = function(dir, file, data, callback){

    var fileToUpdate = lib.baseDir + dir + '/' + file + '.json';

    // Open the file for writing
    fs.open(fileToUpdate, 'r+', function(err, fileDescriptor){
        
        if(!err && fileDescriptor){
            
            // Convert data to string
            var stringData = JSON.stringify(data);
  
            // Truncate the file
            fs.truncate(fileDescriptor, function(err){
          
                if(!err){
            
                    // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData,function(err){
                    
                        if(!err){
                
                            fs.close(fileDescriptor,function(err){
                  
                                if(!err){
                                    callback(false);
                                }
                                else {
                                    callback('Error closing existing file');
                                }
                            });
                        } 
                        else {
                            callback('Error writing to existing file');
                        }
                    });
                }
                else {
                    callback('Error truncating file');
                }
            });
        }
        else {
            callback('Error opening file for updating, it may not exist yet');
        }
    });  
};


//Function to delete a file
lib.delete = function(dir, file, callback){
    
    var fileToDelete = lib.baseDir + dir + '/' + file + '.json';

    // Unlink the file from the filesystem
    fs.unlink(fileToDelete, function(err){
      
        if(!err){
            callback(false);
        }
        else{
            callback('Error deleting the file ')
        }
    });
}

//Export the module
module.exports = lib;