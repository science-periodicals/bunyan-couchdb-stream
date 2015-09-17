var util = require('util')
  , request = require('request')
  , Writable = require('stream').Writable;

util.inherits(LogStream, Writable);

function LogStream(db, opts) {
  this.db = db;
  this.opts = opts || {};

  this._createdDb = false;

  Writable.call(this, {objectMode: true});
}

LogStream.prototype._write = function(chunk, encoding, callback) {
  request.post({
    url: this.db,
    auth: this.opts.auth,
    json: chunk
  }, function(err, resp, body) {
    if (err) return callback(err);
    if (resp.statusCode >= 400) {

      if (!this._createdDb && resp.statusCode === 404 && body && body.reason === 'no_db_file') {
        // try to create DB
        request.put({
          url: this.db,
          auth: this.opts.auth,
          json: true
        }, function(err, resp, body) {
          this._createdDb = true;
          if (err) return callback(err);
          if (resp.statusCode >= 400) {
            return callback(new Error('Could not create db.' + (body ? (' ' + (body.reason || body.error)) : '')));
          }

          this._write(chunk, encoding, callback);

        }.bind(this));

      } else {
        callback(new Error(body ? body.reason : 'could not POST to CouchDB'));
      }

    } else {
      callback(null);
    }
  }.bind(this));

}


module.exports = LogStream;
