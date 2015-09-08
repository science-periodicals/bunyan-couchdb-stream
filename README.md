# bunyan-couchdb-stream

A writable stream that writes log JSON objects (as generated by bunyan) to CouchDB / PouchDB


    var bunyan = require('bunyan');
    var LogStream = require('bunyan-couchdb-stream');

    var log = bunyan.createLogger({
      name: 'test',
      streams: [{
        stream: new LogStream('http://127.0.0.1:5895/mydb'),
        type: 'raw'
      }],
    });

    log.info({hello: 'world'}, 'hello world');
