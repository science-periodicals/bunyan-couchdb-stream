var util = require('util')
  , request = require('request')
  , Writable = require('stream').Writable;

util.inherits(LogStream, Writable);

function LogStream(db, opts) {
  this.db = db;

  Writable.call(this, {objectMode: true});
}

LogStream.prototype._write = function(chunk, encoding, callback) {

  request.post({
    url: this.db,
    json: chunk
  }, function(err, resp, body) {
    if (err) return callback(err);
    if (resp.statusCode >= 400) {
      callback(new Error(body ? body.reason: 'could not POST to CouchDB'));
    }
    callback(null);
  });

}


module.exports = LogStream;
