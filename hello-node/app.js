require.paths.unshift('./node_modules');

var express = require('express')
  , io = require('socket.io');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
  res.render('index', {
    title: '初めての Node on Cloud Foundry'
  });
});

var socket = io.listen(app);
var count = 0;
var logs = [{name:'kawaz', text:'サーバが再起動したよ', ts:new Date().getTime()}];
socket.on('connection', function(client) {
  count++;
  client.send({act:'count', count:count});
  client.broadcast({act:'count', count: count});
  client.send({act:'logs', logs:logs});
  client.on('message', function(message) {
    if(!message) return;
    if(message && message.act == 'message') {
      if(!/^[a-zA-Z0-9_]+$/.test(message.name) || !message.text) return;
      message.ts = new Date().getTime();
      logs.push({name:message.name, text:message.text, ts:message.ts});
      logs.length > 500 && logs.shift();
    }
    client.send(message);
    client.broadcast(message);
  });
  client.on('disconnect', function() {
    count--;
    client.broadcast({act:'count', count: count});
  });
});

// Only listen on $ node app.js

if(!module.parent) {
  app.listen(process.env.VMC_APP_PORT || 3000);
  console.log("Express server listening on port %d", app.address().port);
}
