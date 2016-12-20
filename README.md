# sp-angular-webpack-starter

Starter project for creating apps with client-side technologies in SharePoint using Angular and Webpack

###Quick Start

``` bash
# clone the repo
$ git clone https://github.com/beyond-sharepoint/sp-angular-webpack/ my-app

# change directory to your app
$ cd my-app

# install the dependencies with npm
$ npm install

# update the configuration file with information about your sharepoint site
$ echo '{"siteUrl": "--your sharepoint site url--"}' > /app/HostWebProxy.config.js

# build HostWebProxy.aspx
$ npm run build-proxy
```

At this point you'll need to manually upload ./dist/HostWebProxy.aspx to your SharePoint web.

This file allows for cross-domain communication to your app.

The default target location is /Shared%20Documents/HostWebProxy.aspx, however
feel free to change this (and the corresponding configuration) to whatever you wish.

``` bash
# start the server
$ npm start
```

At this point a browser will be opened to the sample app.

> Note: While this starter will work for SharePoint on-prem, additional steps need to be taken.