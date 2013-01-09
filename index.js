#!/usr/bin/env node

/*!
 * Capture - simple screenshot tool using PhantomJS
 * Copyright(c) 2013 Mike Moulton <mike@meltmedia.com>
 * MIT Licensed
 */

module.exports = capture;

var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    urlUtil = require('url'),
    async = require('async'),
    S = require('string');
    childProcess = require('child_process');

var MAX_PHANTOMJS_SPAWNS = 10,
    PHANTOMJS_BIN = "phantomjs",
    OUT_PATH = "./",
    OUT_FORMAT = "png",
    OUT_DIMENSIONS = "1024*768";

function capture(urls, options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var captureScript = path.join(__dirname, 'phantomjs/capture.js'),
      phantomPath = options.phantomBin || PHANTOMJS_BIN,
      outPath = options.out || OUT_PATH,
      format = options.format || OUT_FORMAT,
      dimensions = options.dimensions || OUT_DIMENSIONS,
      username = options.username || false,
      password = options.password || false,
      verbose = options.verbose || false;

  // throttle phantom processes spawns to 10
  async.forEachLimit(urls, MAX_PHANTOMJS_SPAWNS,

    // For each url
    function(url, done) {

      var urlParts = urlUtil.parse(url, true),
          filename = urlParts.pathname,
          auth = urlParts.auth;

      if (S(filename).endsWith("/")) filename += "index"; // Append 

      var filePath = path.resolve(
                      process.cwd(),
                      outPath,
                      S(urlParts.hostname).replaceAll("\\.", "-").s,
                      "./" + filename + "." + format),
          args = [].concat([captureScript, url, filePath, dimensions]);

      if (auth) {
        var authParts = auth.split(':');
        args = args.concat([authParts[0], authParts[1]]);
      } else if (username && password) {
        args = args.concat([username, password]);
      }

      var phantom = childProcess.execFile(phantomPath, args, function(err, stdout, stderr) {
        if (verbose && stdout) console.log("---\nPhantomJS process stdout [%s]:\n" + stdout + "\n---", phantom.pid);
        if (verbose && stderr) console.log("---\nPhantomJS process stderr [%s]:\n" + stderr + "\n---", phantom.pid);
        console.log("Rendered %s to %s", url, filePath);
        done(err);
      });
      if (verbose)
        console.log("Spawning PhantomJS process [%s] to rasterize '%s' to '%s'", phantom.pid, url, filePath);
    },

    // Once all urls are processes
    function(err) {
      callback(err);
    });

}

function main() {

  var options = {};

  var optimist = require('optimist')
    .usage('Capture screenshots of URLs.\nUsage: $0 [url1, url2, ...]', {
      'v': {
        'type': 'boolean',
        'description': 'Verbose logging',
        'alias': 'verbose'
      },
      'o': {
        'type': 'string',
        'description': 'Output directory for captured screenshots',
        'alias': 'out'
      },
      's': {
        'type': 'string',
        'description': 'Read list of urls from JSON file',
        'alias': 'src'
      },
      'f': {
        'type': 'string',
        'description': 'Output image format (png, jpg, gif)',
        'alias': 'format',
        'default': 'png'
      },
      'P': {
        'type': 'string',
        'description': 'Path to phantomjs bin',
        'alias': 'phantomjs'
      },
      'u': {
        'type': 'string',
        'description': 'HTTP Basic Auth Username',
        'alias': 'username'
      },
      'p': {
        'type': 'string',
        'description': 'HTTP Basic Auth Password',
        'alias': 'password'
      },
      'd': {
        'type': 'string',
        'description': 'Minimum viewport dimensions',
        'alias': 'dimensions'
      }
    })
    .check(function(argv) {
      if (!argv._.length && !argv.s) {
        throw 'You must define at least one url to capture.';
      }
    });

  var argv = optimist.argv;

  var urls = argv.s ? [] : argv._;

  if (argv.s) {
    try {
      var file = argv.s;
      if (fs.statSync(file).isFile()) {
        var data = fs.readFileSync(file);
        var parsedUrls = JSON.parse(data);
        parsedUrls.forEach(function(item) {
          urls.push(item.url);
        });
      }
    }
    catch (err) {
      console.error("Unknown error", err);
      process.exit(1);
    }
  }

  // setup capture options from CLI args
  if (argv.o) options.out = argv.o; // Output directory
  if (argv.P) options.phantomBin = argv.P; // PhantomJS bin path
  if (argv.f) options.format = argv.f; // Output image format
  if (argv.d) options.dimensions = argv.d; // Output image dimensions
  if (argv.u) options.username = argv.u; // HTTP Basic Auth Username
  if (argv.p) options.password = argv.p; // HTTP Basic Auth Password
  if (argv.v) options.verbose = true;

  var start = new Date().getTime();

  capture(urls, options, function(err) {
    var status = 0,
        end = new Date().getTime();

    if (err) {
      console.error("Error during capture process:", err);
      status++;
    } else {
      console.log("Capture complete [%d miliseconds to execute]", end - start);
    }

    process.exit(status);

  });

}

if (require.main === module)
  main();