var WebSocketServer = require('websocket').server

function init(){
    var wss = new WebSocketServer({
        httpServer: httpServer,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });
    
    
    var connections = [];
    var commands = [];
    wss.on('request', function(request) {
        var connection = request.accept('bashao-test', request.origin);
        //console.log(connection);

        // 当前注册的connection 以访问ip为key，保存到wpp对象中。
        var ipKey = connection.remoteAddress;
        wpp[ipKey] =  connection;

    	// console.log(wpp);
        console.log(connection.remoteAddress + " connected - Protocol Version " + connection.websocketVersion);
        
        // Send all the existing canvas commands to the new client
        // connection.sendUTF(JSON.stringify({
        //     msg: "initCommands"
        // }));
        
        // Handle closed connections
        connection.on('close', function() {
            console.log(connection.remoteAddress + " disconnected");
            if (wpp[ipKey]) {
                // remove the connection from the pool
                delete wpp[ipKey];
            }
        });
        
        // Handle incoming messages
        connection.on('message', function(message) {
            // console.log(message);
            if (message.type === 'utf8') {
                try {
                    var command = JSON.parse(message.utf8Data),
						action = command['action'] || 'shell';
                    if (command && command['action']) {
                        var actionPath = process.cwd() + '/app/actions/' + action;
                        //console.log(actionPath);
                        var temp = require(actionPath);
                        
                        if(typeof temp[command['func']] === 'function'){
                        	temp[command['func']](command['params'], connection);
                        }
                    }
                    
                }
                catch(e) {
                    // do nothing if there's an error.
                }
            }
        });
    });
}

exports.webss = init;