/*!
 * Capture - simple screenshot tool using PhantomJS
 * Copyright(c) 2013 Mike Moulton <mike@meltmedia.com>
 * MIT Licensed
 */


var capture = require('../'),
    assert = require('assert'),
    wrench = require('wrench'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var httpServer;

describe('capture', function() {

  before(function(done) {
    httpServer = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('<html><body><h1>Hello World</h1></body></html>\n');
    }).listen(8899, "127.0.0.1");
    done();
  });

  describe('#capture()', function() {

    it('should capture screenshot of 1 page', function(done) {
      capture(['http://127.0.0.1:8899/'], { out: './test/tmp' }, function(err) {
        assert.ok(fs.statSync(path.join(__dirname, 'tmp/127-0-0-1/index.png')).isFile());
        done();
      });
    });

    it('should capture screenshot of 1 page to a specific file', function(done) {
      capture(['http://127.0.0.1:8899/'], { out: './test/tmp/screenshot.png' }, function(err) {
        assert.ok(fs.statSync(path.join(__dirname, 'tmp/screenshot.png')).isFile());
        done();
      });
    });

    it('should capture screenshot of 1 page specified as a string', function(done) {
      capture('http://127.0.0.1:8899/', { out: './test/tmp' }, function(err) {
        assert.ok(fs.statSync(path.join(__dirname, 'tmp/127-0-0-1/index.png')).isFile());
        done();
      });
    });
  });

  after(function(done) {
    var temp = path.join(__dirname, './tmp');
    wrench.rmdirSyncRecursive(temp);
    done();
  });

});


