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
    pass: process.env.COUCH_ADMIN_PASSWORD
  };

  it('should create a DB and write to CouchDB', function(done) {

    // we would need to do log.close() to be able to detect the
    // `finish` event of the logStream but the close method is currently
    // commented out see https://github.com/trentm/node-bunyan/issues/192
    // so we use the changes feed to test

    (function _follow() {

      var feed = follow({
        since: 0,
        db: db,
        include_docs: true
      }, function(err, change) {
        if (err) {
          if (/no_db_file/.test(err.message)) {
            return setTimeout(_follow, 500);
          } else {
            return console.error(err);
          }
        }
        assert.equal(change.doc.foo, 'bar');
        assert.equal(change.doc.msg, 'hello world');
        feed.stop();
        done();
      });

    })();


    var log = bunyan.createLogger({
      name: 'test',
      streams: [{
        stream: new LogStream(db, {auth: auth}),
        type: 'raw'
      }],
    });

    log.info({foo: 'bar'}, 'hello world');

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
