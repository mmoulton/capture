/*!
 * Capture - simple screenshot tool using PhantomJS
 * Copyright(c) 2013 Mike Moulton <mike@meltmedia.com>
 * MIT Licensed
 *
 * PhantomJS script for captureing a screenshot of a single URL
 * Waits for all resources to load on the page before attempting the captrue
 */

var page = require('webpage').create(),
    system = require('system'),
    auth, address, output, resources = {};

var TIMEOUT = 60000,
    RESOURCE_LOAD_WINDOW = 50,
    RESOURCE_CHECK_SLEEP = 10;

// usage sanity check
if (system.args.length < 3 || system.args.length > 6) {
  console.log('Usage: capture.js URL filename [viewportWidth*viewportHeight] [username] [password]');
  phantom.exit(1);
}

address = system.args[1]; // URL
output = system.args[2]; // Output file

// setup the viewport sizing
if (system.args.length > 3) {
  viewportSize = system.args[3].split('*');  
  page.viewportSize = { width: viewportSize[0], height: viewportSize[1] };  
} else {
  page.viewportSize = { width: 1024, height: 768 };  
}

// handle BASIC Auth
if (system.args.length > 4) {
  page.settings.userName = system.args[4]; // username
  page.settings.password = system.args[5]; // password
}

// handle resource loads, tracking each outstanding request
page.onResourceRequested = function (req) {
  // Match only http(s) protocols
  if (req.url.match(/^http(s)?:\/\//i)) {
    resources[req.id] = true;
  }
};

// handle resource load completions, marking the resource as received
page.onResourceReceived = function (res) {
  if (resources[res.id]) {
    delete resources[res.id];
  }
};

// open the page
page.open(address, function (status) {

  var elapsedSinceLastResource = 0;

  // fail fast if their was an error loading the initial page
  if (status !== 'success') {
    console.log('Unable to load the address: ' + address);
    phantom.exit();
  }

  var capturePage = function () {

    window.setTimeout(function () {
      // no resources currently pending, might be ready to capture
      if (Object.keys(resources).length == 0) {

        // no pending resources and waiting period has expired
        // so we can assume page is ready to be captured
        if (elapsedSinceLastResource >= RESOURCE_LOAD_WINDOW) {
          page.render(output);
          phantom.exit();

        // no pending resources, but still in waiting period
        } else {
          elapsedSinceLastResource += RESOURCE_CHECK_SLEEP;
        }

      // their are pending resources, not in waiting period
      } else {
        elapsedSinceLastResource = 0;
      }

      // we did not capture this iteration, sleep
      capturePage();

    }, RESOURCE_CHECK_SLEEP);
  };

  // set failsafe incase of failed resource load, 404, slow pages, etc.
  window.setTimeout(function () {
    console.log('Timeout loading: ' + address);
    phantom.exit();
  }, TIMEOUT);

  // capture the screenshot
  capturePage();

});
