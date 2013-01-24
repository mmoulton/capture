# Capture - Simple screenshot tool using PhantomJS [![Build Status](https://travis-ci.org/mmoulton/capture.png)](https://travis-ci.org/mmoulton/capture)

Capture, as it's name implies, will capture a screenshot of one or more URL's using [PhantomJS](http://phantomjs.org). The format of the screenshot can be anything supported by Phantom, such as PNG, GIF, JPG, or PDF.

Capture is a Node.js based library that can be used as a module within another application, or as a stand alone tool via it's command line interface (CLI).

## Install

To install capture you must first have Node.js, NPM and PhantomJS installed, all of which is outside the scope of these instructions. Please see the [Node.js Website](http://nodejs.org) for details on how to install Node and NPM. Personaly I am found of Tim Caswell's excelent [NVM](https://github.com/creationix/nvm) tool for insalling and managing Node. [Homebrew](http://mxcl.github.com/homebrew/) is also an excelent tool for installing PhantomJS, Node or NPM on a Mac.

Once NPM is installed, simply install Capture by executing the following from the command line:

	npm install capture -g


## Command Line Usage

Once installed, you can explore what capture can do by simply typing `capture` into the command line. You will get the built in help that looks something like this:

	Capture screenshots of URLs.
	Usage: capture [url1 url2 ...]

	Options:
		-v, --verbose     Verbose logging                            [boolean]
		-o, --out         Output directory for captured screenshots  [string]
		-f, --format      Output image format (png, jpg, gif)        [string]  [default: "png"]
		-P, --phantomjs   Path to phantomjs bin                      [string]
		-u, --username    HTTP Basic Auth Username                   [string]
		-p, --password    HTTP Basic Auth Password                   [string]
		-d, --dimensions  Minimum viewport dimensions                [string]
		-h, --help        Show this help message and exit            [boolean]

Executing `capture http://your-domain.com/ http://your-domain.com/about/` will create a directory in the current working directory with the following structure:

	your-domain-com/
		index.png
		about/
			index.png

### Reading JSON from *stdin*

Capture also supports reading in JSON from *stdin*. It will do it's best to find URL's within the data structure. For example, all of the following data structures are valid input:

**Array of strings:**

	capture << EOF
	[ "http://your-domain.com" ]
	EOF

**Array of Objects with property of *url*:**

	capture << EOF
	[ { "url": "http://your-domain.com" } ]
	EOF

**Object with property of *url*:**

	capture << EOF
	{ "url": "http://your-domain.com" }
	EOF

## Example Use Cases

Capture was writen to aid in regression testing of websites where large cross-cutting changes to things such as CSS were made and we wished to understand the visual differences that might exist between an existing version of a site and the newly modified version. To accomplish this, Capture, coupled with [Crawl](http://github.com/mmoulton/crawl) allows us to take screenshots of both the old and new versions of the site, then perform image differencing on the results. One handy tool for performing the image differencing is a Mac app called [Kaleidoscope](http://www.kaleidoscopeapp.com).

## The MIT License

Copyright (c) Mike Moulton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
