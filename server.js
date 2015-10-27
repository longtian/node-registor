/**
 * Created by yan on 15-10-27.
 */
var express = require('express');
var httpProxy = require('http-proxy');
var path = require('path');

var proxy = httpProxy.createProxyServer({
  target: {
    socketPath: '/var/run/docker.sock'
  }
});

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/docker', function (req, res) {
  proxy.web(req, res);
});

app.listen(3000);
