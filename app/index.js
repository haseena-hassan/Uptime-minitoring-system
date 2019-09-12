/*Description : Primary file for the API
 *Author : haseena-hassan
 *Date : 12/09/19
 */

 //Dependancies
 var http = require('http');
 var url = require('url');

/*
    When we create the server and tell it to listen, when someone hits localhost:3000 the function gets called 
    each time. req object consist of a whole bunch of info on what the user is asking for, ie it contains url key too,
    which is used by parse function. true means parse the query string which inturn calls the query string module itself

*/

 //creating server that shuold respond to the request with a string
var server = http.createServer(function(request, response){

    //Get the url and parse it
    var parsedUrl = url.parse(request.url, true)    //parsedUrl is now an obj with whole bunch of keys of parsed metadata of the request url that came in

    //Get the path from the url via the parsedUrl object
    var path = parsedUrl.pathname;    //it is the untrimmed path that the user requests
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');    //string regex : trimming any extraneous '/' frm path
    

    //Get query string as an object
    var queryStringObject = parsedUrl.query;

    //Get http method
    var method = request.method.toLowerCase();

    //send the response
    response.end('Hello Worldd !\n');

    //Log what path the person was asking for
    console.log('Request received at path : ' + trimmedPath + '\twith method : '
                 + method + ' , with query string parameters as : ',queryStringObject);

});

//start server and listen to port 2000
server.listen(2000, function(){
    console.log('The server is listening to port 2000 now ')
})