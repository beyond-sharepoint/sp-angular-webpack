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

# deploy HostWebProxy.aspx to SharePoint Online (on-prem deploy support is coming)
# HostWebProxy.aspx allows for cross-domain communication to your app.
# The default target location is <tenant>/Shared%20Documents/HostWebProxy.aspx
# You can also deploy this manually through your web browser (run npm run build-proxy, the file is located at ./dist/HostWebProxy.aspx)
$ npm run deploy-proxy-spo

# start the server
$ npm start
```

At this point a browser will be opened to the sample app.

> Note: While this starter will work for SharePoint on-prem, additional steps need to be taken.

TODO:

 -[ ] Add a configure script which modifies ./app/HostWebProxy.config.js
 -[ ] Support transferrable objects in HostWebProxy for large uploads/downloads
 -[ ] Add an angular http interceptor for any $http requests going to the siteweb
 -[ ] Figure out growth in app.bundle.js
 -[ ] Better debugging experience? (really a bable/webpack thing. maybe document local vars are  off of context_)
- [ ] Finish Samples
    - [ ] File Upload
    - [ ] Document Set
    - [ ] Pdf Generation/Viewer
    - [ ] Forms Library browser
    - [ ] ...
- [ ] Deployment Scripts
    - [ ] Deploy-App-SPO
    - [X] Deploy-Proxy-SPO
- [ ] On-Prem Support
  - [ ] Test On-Prem (and document steps!)
  - [ ] Deploy-App-SP (Requires NTLM Auth Lib)
  - [ ] Deploy-Proxy-SP (Requires NTLM Auth Lib)
