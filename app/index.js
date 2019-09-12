/*Description : Primary file for the API
 *Author : haseena-hassan
 *Date : 12/09/19
 */

 //Dependancies
 var http = require('http');

 //creating server that shuold respond to the request with a string
var str = "Hello Worldd !\n";
var server = http.createServer(function(request, response){
    response.end(str);
});

//start server and listen to port 2000
server.listen(2000, function(){
    console.log('The server is listening to port 2000 now ')
})