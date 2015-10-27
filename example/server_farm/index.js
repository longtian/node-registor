/**
 * Created by yan on 15-10-27.
 */
var WebSocket = require('ws');
var express = require('express');
var request = require('request');

var ws = new WebSocket('ws://127.0.0.1:32812');
var app = express();

var apiServers = [];

ws.on('message', function (msg) {
  var msgObject = JSON.parse(msg);
  var payLoad = msgObject.payLoad;
  if (msgObject.status === 'start') {
    var hostIp = payLoad.NetworkSettings.Ports['80/tcp'][0].HostIp;
    var hostPort = payLoad.NetworkSettings.Ports['80/tcp'][0].HostPort;
    apiServers.push(hostIp + ":" + hostPort);
  } else if (msgObject.status === 'kill') {
    var ip = payLoad.NetworkSettings.IPAddress;
    apiServers.splice(apiServers.indexOf(ip), 1);
  }
});

app.get('/time', function (req, res) {
  var result = {};
  var count = apiServers.length;

  if (count) {
    apiServers.forEach(function (hostName) {
      request.get('http://' + hostName, function (error, response, message) {
        console.log(arguments);
        result[hostName] = response.headers;
        count--;
        if (count <= 0) {
          res.json(result);
        }
      })
    })
  } else {
    res.end('Waiting for servers');
  }

});

app.listen(3003);

