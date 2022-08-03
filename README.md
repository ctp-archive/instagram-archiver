# Instagram preserver

A tool to convert an instagram feed to a static HTML file. Instagram is frustrating to archive because it requires logging in to view user account data, and the pages themselves include infinite scroll and other features that make archiving difficult. This package emulates logging into Instagram with an account you control, then uses internal Instagram APIs to download content and render it to a static HTML page.

## Installation

This package requires NodeJS. Install node, download this repository, then run `npm install`.

## Usage

First, set an instagram username and password in your environment variables:

`INSTAGRAM_USER` - Username of your Instagram account
`INSTAGRAM_PASS` - Password of your Instagram account
`INSTAGRAM_TARGET_USER` - Username you want to archive

Then run:

```shell
node download.js
node build-html.js
```

You may get a 404 error on the download command - as long as it has saved a file called `_data/feed.json` you should be good to go. This is a known issue with the Instagram Internal API.

This script can take awhile, as ait downloads all the images associated with the Instagram account. The final output is stored into `./public`

## CHanging template

Theree is a simple [Nunjucks](https://mozilla.github.io/nunjucks/) template in `template.njk` you can use to change the style of the output.
