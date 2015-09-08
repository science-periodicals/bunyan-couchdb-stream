var assert = require('assert')
  , bunyan = require('bunyan')
  , request = require('request')
  , follow = require('follow')
  , LogStream = require('..');


describe('bunyan couchdb stream', function() {
  this.timeout(100000);

  var db = 'http://127.0.0.1:5984/test-bunyan-couchdb-stream';
  var auth = {
    user: process.env.COUCH_ADMIN_USERNAME,
    pass: process.env.COUCH_ADMIN_PASSWORD,
  }

  before(function(done) {
    request.put({
      url: db,
      auth: auth
    }, function(err, resp, body) {
      done();
    });
  });

  it('should write to CouchDB', function(done) {

    // we would need to do log.close() but the close method is currently commented out see https://github.com/trentm/node-bunyan/issues/192 so we use the changes feed to test
    var feed = follow({
      db: db,
      include_docs: true
    }, function(err, change) {
      assert.equal(change.doc.hello, 'world');
      assert.equal(change.doc.msg, 'hello world');
      feed.stop();
      done();
    });


    var log = bunyan.createLogger({
      name: 'test',
      streams: [{
        stream: new LogStream(db),
        type: 'raw'
      }],
    });


    log.info({hello: 'world'}, 'hello world');

  });

  after(function(done) {
    request.del({
      url: db,
      auth: auth
    }, function(err, resp, body) {
      done();
    });
  });


});
