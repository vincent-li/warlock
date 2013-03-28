var WebSocketServer = require('websocket').server;
var config;
try {
    config = require(process.cwd() + '/config/websocket');
} catch(e) {
    config = {
        'def' : 'gamehall'
    };
}
var c,app;
exports.init = function(compound){
    c = compound;
    c.websockets = {};
    app = c.app;
    var i = 0;
    for(var key in config){
        var wss = new WebSocketServer({
            httpServer: app,
            autoAcceptConnections: false,
            id : ++i,
            conns : {}
        });
        c.websockets[config[key]] = wss;
        initConnection(wss,config[key]);
    }
    c.websockets['count'] = i;
}

exports.create = function(acceptName){    
    if(c.websockets[acceptName]){
        console.log('this server have beed created!');
        return false;
    }else{
        var wss = new WebSocketServer({
            httpServer: app,
            autoAcceptConnections: false,
            id : c.websockets['count'],
            conns : {},
            count : 0
        });
        c.websockets[acceptName] = wss;
        initConnection(wss,acceptName);
        c.websockets['count']++;
    }     
}
function initConnection(wss,acceptName){
    var connections = [];
    var commands = [];
    wss.on('request', function(request) {
        var connection = request.accept(acceptName, request.origin);
        // 当前注册的connection 以访问ip为key，保存到wpp对象中。
        var ipKey = connection.remoteAddress;
        //console.log(connection);
        var conn = {
            conn : connection,
            ip : ipKey,
            acceptName : acceptName
        }
        
        wss.conns[ipKey] = conn;
        wss.count++;
        // console.log(wpp);
        console.log(connection.remoteAddress + " connected - Protocol Version " + connection.websocketVersion);
        
        // Handle closed connections
        connection.on('close', function() {
            console.log(connection.remoteAddress + " disconnected");
            removeConnection(connection,acceptName); 
        });
        
        // Handle incoming messages
        connection.on('message', function(message) {
            // console.log(message);
            if (message.type === 'utf8') {
                handleMessage(connection,message);
            }
        });
    });
}
function handleMessage(connect,msg){
    try {
        var command = JSON.parse(message.utf8Data),
            action = command['action'];
        if (command && command['action']) {
            var act = command['action'].split('#');
            var actionPath = process.cwd() + '/app/helpers/' + act[0];
            //console.log(actionPath);
            var temp = require(actionPath);
            
            if(typeof temp[act[1]] === 'function'){
                temp[act[1]](command['params'], connection);
            }
        }else{
            connect.sendUTF(JSON.stringify(command));
        }
    }
    catch(e) {
        // do nothing if there's an error.
        console.log(e);
        return false;
    }
}
function removeConnection(conn,acceptName){
    var ipKey =  conn.remoteAddress;
    conn.disconnected();
    var wss = c.websockets[acceptName];
    wss.conns.removeAttribute(ipKey);
    wss.count--
}