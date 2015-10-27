/**
 * Created by yan on 15-10-27.
 */
var express = require('express');
var httpProxy = require('http-proxy');
var path = require('path');
var WebSocketServer = require('ws').Server;
var bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'registor-server'
});
var server = require('http').createServer();
var wss = new WebSocketServer({server: server});
var proxy = httpProxy.createProxyServer({
  target: {
    socketPath: '/var/run/docker.sock'
  }
});
var app = express();
var dockerEvents = require('./');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/docker', function (req, res) {
  proxy.web(req, res);
});

dockerEvents.on('event', function (data) {
  log.info('broadcasting to %d clents', wss.clients.length);
  wss.clients.forEach(function (client) {
    client.send(JSON.stringify(data));
  });
});

dockerEvents.on('error', function () {
  log.error(arguments);
});

wss.on('connection', function (c) {
  var remoteAddress = {
    remotePort: c._socket.remotePort,
    remoteFamily: c._socket.remoteFamily,
    remoteAddress: c._socket.remoteAddress
  }
  log.info('connection', remoteAddress);
})

server.on('request', app);

server.listen(3000, function () {
  log.info('listening on', server.address().port);
});