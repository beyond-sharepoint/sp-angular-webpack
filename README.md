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
```

Edit /app/config.json and update with your SharePoint Urls

At this point you'll need to manually upload the HostWebProxy file from my-app/assets/HostWebProxy.aspx to your sharepoint web.

This file allows for cross-domain communication to your app.

The default location is /Shared%20Documents/HostWebProxy.aspx, however
feel free to change this (and the corresponding configuration) to whatever you wish.

``` bash
# start the server
$ npm start

```

You'll be able to open a browser to http://localhost:8080 and view the samples that use data from your sharepoint web.