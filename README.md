# Capture - Simple screenshot tool using PhantomJS

## Install

   npm install capture -g

## Usage

  Capture screenshots of URLs.
  Usage: node ./index.js [url1, url2, ...]

  Options:
    -v, --verbose     Verbose logging                            [boolean]
    -o, --out         Output directory for captured screenshots  [string]
    -s, --src         Read list of urls from JSON file           [string]
    -f, --format      Output image format (png, jpg, gif)        [string]  [default: "png"]
    -P, --phantomjs   Path to phantomjs bin                      [string]
    -u, --username    HTTP Basic Auth Username                   [string]
    -p, --password    HTTP Basic Auth Password                   [string]
    -d, --dimensions  Minimum viewport dimensions                [string]
