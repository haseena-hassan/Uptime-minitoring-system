/*Description : Primary file for the API
 *Author : haseena-hassan
 *Date : 12/09/19
 */

 //Dependancies
 var http = require('http');
 var url = require('url');
 var stringDecoder = require('string_decoder').StringDecoder;

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

    //Get the the headers as object
    var headers = request.headers;

    //Get payloads, if any
    var decoder = new stringDecoder('utf-8');       //telling it what encoding or charset it should decode
    var buffer = '';                                //as new data comes we append it to buffer
    
    //as the data is streaming in,the request object emits 'data' event , when the request object emits or 'on' the event, data, we want a callback to be called and we want the data 
    //that is being emitted to be passed to this callback within which we want our buffer to have the new data appended to it via a decoder

    request.on('data', function(data){        //if there is no payload, buffer remain empty, ie data event never happens but still end event happens
        buffer += decoder.write(data);
    });

    request.on('end', function(){           //end is another event which lets us know its done when its done and ends the buffer next we move the response and request log to the end event handler

        buffer += decoder.end();            //cap off the buffer with whatever it ended with

        //send the response
        response.end('Hello Worldd !\n');

        //Log what path the person was asking for
        console.log('Request received at path : ' + trimmedPath);
        console.log('Request received with HTTP method : ' + method ) ;
        console.log('Request received with query string parameters as : ',queryStringObject);
        console.log('Request received with these headers : \n',headers);
        console.log('Request received with these payloads : ',buffer);      //this is how streams are handled in node
    });



});

//start server and listen to port 2000
server.listen(2000, function(){
    console.log('The server is listening to port 2000 now ')
})