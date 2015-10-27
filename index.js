/**
 * Created by yan on 15-10-27.
 */
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var request = require('request');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'registor'
});

var eventSource = new EventEmitter();

function errorHandler() {
  log.error(arguments);
  eventSource.emit.apply(eventSource, 'error', arguments);
}

var req = http.request({
  path: '/events',
  socketPath: '/var/run/docker.sock'
}, function (res) {
  log.info('connected to docker daemon %s', res.req.socketPath);
  log.info('headers.server %s', res.headers.server);

  res.on('error', errorHandler);
  res.on('data', function (buf) {
    var eventObject = JSON.parse(buf.toString());
    log.info('event', eventObject);

    var url = 'http://unix:/var/run/docker.sock:/containers/' + eventObject.id + '/json';
    log.info('request container information', {
      url: url
    });

    request.get(url, function (error, response, body) {
      log.info('receive container information', {
        statusCode: response.statusCode
      });

      if (response.statusCode == '200') {
        try {
          eventObject.payLoad = JSON.parse(body);
          eventSource.emit('event', eventObject);
          log.trace('event', eventObject);
        } catch (error) {
          eventSource.emit('error', body);
        }
      } else {
        eventSource.emit('error', body);
      }
    });
  });
});

req.on('error', errorHandler);

req.end();

module.exports = eventSource;