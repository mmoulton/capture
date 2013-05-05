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
    OUT_VIEWPORT_WIDTH = 1024,
    OUT_VIEWPORT_HEIGHT = 768,
    OUT_PAPER_ORIENTATION = "portrait",
    OUT_PAPER_FORMAT = "A4",
    OUT_PAPER_MARGIN = "2.5mm";

function capture(urls, options, callback) {

  if (typeof urls === 'string') {
    urls = new Array(urls);
  }

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  var captureScript = path.join(__dirname, 'phantomjs/capture.js'),
      phantomPath = options.phantomBin || PHANTOMJS_BIN,
      outPath = options.out || OUT_PATH,
      format = options.format || OUT_FORMAT,
      viewportWidth = options.viewportWidth || OUT_VIEWPORT_WIDTH,
      viewportHeight = options.viewportHeight || OUT_VIEWPORT_HEIGHT,
      paperOrientation = options.paperOrientation || OUT_PAPER_ORIENTATION,
      paperFormat = options.paperFormat || OUT_PAPER_FORMAT,
      paperMargin = options.paperMargin || OUT_PAPER_MARGIN,
      username = options.username || false,
      password = options.password || false,
      verbose = options.verbose || false;

  // throttle phantom processes spawns to 10
  async.forEachLimit(urls, MAX_PHANTOMJS_SPAWNS,

    // For each url
    function(url, done) {

      var urlParts = urlUtil.parse(url, true),
          filename = urlParts.pathname,
          auth = urlParts.auth,
          filePath;

      // The outPath is a file, so don't generate the URLs automatically
      if ([".pdf", ".jpg", ".png", ".gif"].indexOf(outPath.substr(-4)) !== -1) {
        filePath = outPath;
      } else {
        if (S(filename).endsWith("/")) filename += "index"; // Append

        filePath = path.resolve(
                    process.cwd(),
                    outPath,
                    S(urlParts.hostname).replaceAll("\\.", "-").s,
                    "./" + filename + "." + format);
      }

      var args = [captureScript, url, filePath, '--username', username,
        '--password', password, '--paper-orientation', paperOrientation,
        '--paper-margin', paperMargin, '--paper-format', paperFormat,
        '--viewport-width', viewportWidth, '--viewport-height', viewportHeight];

      var phantom = childProcess.execFile(phantomPath, args, function(err, stdout, stderr) {
        if (verbose && stdout) console.log("---\nPhantomJS process stdout [%s]:\n" + stdout + "\n---", phantom.pid);
        if (verbose && stderr) console.log("---\nPhantomJS process stderr [%s]:\n" + stderr + "\n---", phantom.pid);
        if (verbose) console.log("Rendered %s to %s", url, filePath);
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
    .usage('Capture screenshots of URLs.\nUsage: $0 [url1 url2 ...]', {
      'verbose': {
        'type': 'boolean',
        'description': 'Verbose logging',
        'alias': 'v'
      },
      'out': {
        'type': 'string',
        'description': 'Output directory for captured screenshots',
        'alias': 'o'
      },
      'format': {
        'type': 'string',
        'description': 'Output image format (png, jpg, gif, pdf)',
        'alias': 'f',
        'default': 'png'
      },
      'phantomjs': {
        'type': 'string',
        'description': 'Path to phantomjs bin',
        'alias': 'P'
      },
      'username': {
        'type': 'string',
        'description': 'HTTP Basic Auth Username',
        'alias': 'u'
      },
      'password': {
        'type': 'string',
        'description': 'HTTP Basic Auth Password',
        'alias': 'p'
      },
      'viewport-width': {
        'type': 'string',
        'description': 'Minimum viewport width',
        'alias': 'vw',
		'default': OUT_VIEWPORT_WIDTH
      },
	  'viewport-height': {
        'type': 'string',
        'description': 'Minimum viewport height',
        'alias': 'vh',
        'default': OUT_VIEWPORT_HEIGHT
      },
      'paper-format': {
        'type': 'string',
        'description': 'Size of the individual PDF pages (A4, letter)',
        'alias': 'pf',
		'default': OUT_PAPER_FORMAT
      },
      'paper-orientation': {
        'type': 'string',
        'description': 'Orientation of the PDF pages (portrait, landscape)',
        'alias': 'po',
		'default': OUT_PAPER_ORIENTATION
      },
      'paper-margin': {
        'type': 'string',
        'description': 'Margin of the PDF pages (2cm, 5mm, etc.)',
        'alias': 'pm',
        'default': OUT_PAPER_MARGIN
      },
      'help' : {
        'type': 'boolean',
        'description': 'Show this help message and exit',
        'alias': 'h'
      }
    });

  var argv = optimist.argv;

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  // Use url's provided as arguments in CLI
  if (argv._ && argv._.length > 0) {
    captureUrls(argv._);
  }

  // try to read JSON from standard in
  else {
    var stdinData = "";

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
      stdinData += chunk;
    })

    process.stdin.on('end', function(){
      parseJsonInput(stdinData);
    });
  }

  function parseJsonInput(data) {
    try {
      var urls = [],
          parsedUrls = JSON.parse(data);

      function findUrl(item) {
        if ("string" == typeof item) {
          urls.push(item);
        } else if ("object" == typeof item && item.url) {
          urls.push(item.url);
        } else {
          console.error("Unable to extract url from: ", item);
        }
      }

      if ("object" == typeof parsedUrls) {
        if (parsedUrls.constructor == Array) {
          parsedUrls.forEach(function(item) {
            findUrl(item);
          });
        } else {
          findUrl(parsedUrls);
        }
      }

      captureUrls(urls);
    }
    catch (err) {
      console.error("Unable to parse JSON from stdin", err);
      console.trace();
      process.exit(1);
    }
  }

  function captureUrls(urls) {

    if (!urls || urls.length == 0) process.exit(1);

    var start = new Date().getTime();

    capture(urls, argv, function(err) {
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

}

if (require.main === module)
  main();
