![David](https://david-dm.org/beyond-sharepoint/sp-angular-webpack.svg)
# sp-angular-webpack-starter

Starter project for creating apps with client-side technologies in SharePoint using Angular and Webpack

The purpose of this project is three-fold:
 1. Provide a starter project for developers creating SP apps using modern client-side technologies to easily get started with.
 2. Demonstrate an alternative to SharePoint 'apps' and SharePoint REST service access via [web messaging](https://en.wikipedia.org/wiki/Web_Messaging) that can be hosted completely from CDN (GitHub Pages, Amazon S3, Azure CDN or other similar cloud storage)
 3. Provide a number of samples to demonstrate the types of solutions that can be created with HTML+JS with sharepoint.

### Quick Start

##### Prerequisites
To start developing with SP-Angular-Webpack-Starter you'll need a few things:
First, make sure you've got a recent version of node.js and git installed.

I also recommend VSCode as an editor, but feel free to use whatever editor suits your fancy.

##### Clone and Install Dependencies
Next, you'll need to clone the sp-angular-webpack repository and install its dependencies.
``` bash
# clone the repo
$ git clone -o sp-angular-webpack -b master --single-branch https://github.com/beyond-sharepoint/sp-angular-webpack/ my-app

# change directory to your app
$ cd my-app

# install the dependencies with npm
$ npm install
```

##### Configure
Once you have the dependencies installed, let's configure the app to point to your SharePoint tenant.

You can either edit the configuration file located in ./src/HostWebProxy.config.json in a text editor, or use
the convienant built-in confuration tool.
``` bash
$ npm run configure
```

If you want to enable communication to additional site collections, simply add those server-relative urls to the knownSiteCollections
array within ./src/HostWebProxy.config.json.

for instance:

``` json
"knownSiteCollections": [
  "/",
  "/sites/mysitecollection1",
  "/sites/mysitecollection2"
]
```

##### Build and Deploy HostWebProxy
Now, let's deploy the proxy file that enables cross-domain communication to your app. This proxy file is a small ~110kb file that lives within
any document library on your SharePoint tenant or on-prem installation. 

If you're deploying to SharePoint Online, the starter comes with a npm run script that automates deployment and automatically uses the
proxyUrl you specified in the configuration above. You'll be prompted for your SharePoint Online credentials.

``` bash
$ npm run deploy-proxy-spo
```

If you're deploying to an on-prem SharePoint farm, run this script instead. You'll be prompted for domain credentials.

``` bash
$ npm run deploy-proxy-sp
```

It's possible to also just build the proxy and drag and drop it into the target document library using a browser.

``` bash
$ npm run build-proxy
```

You'll find a file named 'HostWebProxy.aspx' within the /dist folder. Simply upload this file to the document that was configured above.

> For the two above operations, you'll need at least edit or designer permisions on a target web.
> Specifically you'll need the 'Add and Customize Pages' Permission Level.
> Please ensure the target url and the location that the file was copied to match.

Once we've got the proxy uploaded we're ready to go.

##### Start

Now we're ready to go, let's start the local watcher and server.

Start the local server.
``` bash
$ npm start
```

At this point a browser will be opened to the sample app. When you navigate to a sample that requires authentication
with SharePoint Online, you'll be automatically navigated to the login page and back to the app.

The samples provided demonstrate common use cases for interacting with the SharePoint REST services 

### Development

Once you get a feel for the starter, browse the code within ./src/app/**. 

After you're comfortable with what the starter is doing, using your editor of choice,
go ahead and start changing the starter to fit your needs, after all, the starter is here to
facilitate creating your own app.

With the built-in watcher, any changes you make in your editor will cause the application to automatically reload.

Additionally, you can use any ECMAScript 6+ functionality when your building your app. You'll see examples of this
when browsing the code. The starter automatically transpiles down to ECMAScript 2015 and polyfills anything else in.

There are a few branches that contain common scenarios:

 - [blank](https://github.com/beyond-sharepoint/sp-angular-webpack/tree/blank) - Provides a blank starter without the sample code.
 - [blank-material-design](https://github.com/beyond-sharepoint/sp-angular-webpack/tree/blank-material-design) - Blank starter but with angular-material instead of angular-boostrap
### Testing

If you'd like to unit test your app, the starter is configured with karma and uses .spec.js files located in your app. 

To run your unit tests and get code coverage results, simply run:
``` bash
$ npm test
```

### Updating

Down the road you can fetch and merge the recent changes from this repo back into your project:

``` bash
$ git checkout master
$ git fetch sp-angular-webpack
$ git merge sp-angular-webpack/master
$ npm install
```

### Deployment

Once you're happy with your app, it comes time to deploy your app to the target host.

To build files for production, run
``` bash
$ npm run build
```

your app will be bundled and minified and all files dropped into ./dist.

> You may see warnings during the minification process, feel free to ignore these warnings or correct them.

These files can be deployed to any static host, from within a SharePoint document library to a AWS S3, Github Pages to
even desktop apps via Electron or mobile via Cordova/PhoneGap

Ensure that your HostWebProxy settings whitelist the target domain where your files will be hosted on.

### Settings

If you find yourself deploying often, the following environment variables can be set to minimize typing of credentials.

Linux/macOS:
``` bash
$ export sp_angular_webpack_username=<yourusername>
$ export sp_angular_webpack_password=<yourpassword>
```

PowerShell:
```
PS> $env:sp_angular_webpack_username="<yourusername>"
PS> $env:sp_angular_webpack_password="<yourpassword>"
```

Use SET on windows cmd

When using SharePoint on-prem, the following environment variables are used for NTLM based auth:

``` bash
$ export sp_angular_webpack_workstation=<yourusername>
$ export sp_angular_webpack_domain=<yourpassword>
$ export sp_angular_webpack_username=<yourusername>
$ export sp_angular_webpack_password=<yourpassword>
```

### How it works

To enable cross-domain communication between the app and the SharePoint REST services, a HostWebProxy is deployed to the SharePoint tenant.

This .aspx file enables displaying in an iframe and is loaded by the application.

Messages are passed between the hosting application and the iFrame via the postMessage api. This technique is generally called cross-origin via document messaging
and is used in numerous places -- from SPO itself (look for SuiteServiceProxy.aspx in devtools/network when browsing a SPO tenant)  to ADAL to the Microsoft Graph api.

Any time a $http call is made in the application, and the base url is the SharePoint tenant, that http call is intercepted and passed through to the
proxy iframe.

The implementation in this starter is completely custom and also allows large objects to be transferred via the transferrable api (IE10+)

### Roadmap

TODO:

 - [X] Add a configure run script which modifies ./app/HostWebProxy.config.js
 - [X] Support transferable objects in HostWebProxy for large uploads
 - [X] Support large downloads too
 - [X] Replace jQuery.ajax with fetch api+polyfill in HostWebProxy
 - [X] Add an angular http interceptor for any plain-jane $http requests going to the siteweb
 - [X] Figure out growth in app.bundle.js
 - [X] Better debugging experience? (really a bable/webpack thing. maybe document local vars are  off of context_)
 - [X] Make promises angular promises so that $scope.$apply doesn't need to be run after an await.
 - [X] Add the ability to add an array of known site collections to configuration which will be auto-intercepted via httpinterceptor.
 - [ ] Unit test all the things! (nock them out)
 - [ ] Add additional Samples
    - [X] File Upload
    - [ ] File Download with transferrables (Gallery)
    - [ ] Document Set
    - [ ] Pdf Generation/Viewer
    - [ ] Forms Library browser
    - [ ] Bulk File Upload (from Zip)
    - [ ] Cross-site collection copy
    - [ ] ...
 - [ ] Deployment Scripts
    - [ ] Deploy-App-SPO
    - [X] Deploy-Proxy-SPO
    - [ ] Deploy-App-SP (Requires NTLM Auth Lib)
    - [X] Deploy-Proxy-SP (Requires NTLM Auth Lib)
 - [X] On-Prem Support
    - [X] Test On-Prem (and document steps!)

### Frequently Asked Questions (FAQ)

 - Why Angular 1.x? Why not Angular 2?
   
   As of this writing (Jan '17) while Angular 2 is out, the ecosystem and available libraries written in Angular 1.x far exceeds that of Angular 2.x.
   
   There's probably various reasons for that including some instability of Angular 2.x during the RC process and the higher lift that it takes to create Angular 2 components. There's also something to be said about idiomatic JavaScript too.
   
   Given the popularity of React, its preferred use by the Office 365 team and it's conceptual alignment to ASP.Net components, if time permits I may create a React based starter as well.

 - Isn't this breaking the app model? Security?
 
   SharePoint Online uses the [cross-origin document messaging](https://en.wikipedia.org/wiki/Web_Messaging) technique numerous times, as does the MS Graph API. The SharePoint Cross-Domain library and the [ADAL for AngularJS library](https://github.com/AzureAD/azure-activedirectory-library-for-js/blob/master/lib/adal-angular.js) uses the same techniques as this starter.
   
   In "app" terms, this starter uses a "Provider Hosted App" approach, but doesn't require the registration of an "App" in SharePoint. This is good in scenarios where organizations might be confused about what the app/addin model is, and doesn't enable apps either directly through not enabling the app management service, inability to configure DNS to allow wildcard subdomains, not obtaining the necessary wildcart SSL cert or for other reasons. For other organizations that do facilitate the app/addin model, this starter does not preclude packaging the built output as a full SharePoint addin. In both cases the development experience is greatly improved by using this starter.
   
   It is in my opinion that the SharePoint conflaguration of an App (add-in) is a strange beast and unparalleled in the web community. In my opinion, SharePoint Online should be treated as a service (SPaaS) and MS should provide HTML+JS based tools/components that provide the SharePoint client side experience that are completely customizable. This starter aims to approach SharePoint developent in these terms. Hopefully the roadmap of SPFx will bring MS provided SharePoint development closer to this angle.

- What browsers is this compatible with?

  Modern browsers will work with this starter. IE11 and the latest versions of Edge, Chrome, Safari and Firefox have been tested.

- What about static type checking (e.g. TypeScript)?

  This starter comes configured to use [Flow](https://flowtype.org/)-based annotations. Flow provides opt-in type checking with idiomatic JavaScript.
  
  Grab one of the [Flow extensions for VSCode](https://marketplace.visualstudio.com/search?term=flow&target=VSCode&sortBy=Relevance), [Visual Studio](https://marketplace.visualstudio.com/search?term=flow&target=VS&sortBy=Relevance), [Atom](https://atom.io/packages/search?q=flow) or your editor of choice and you're good to go.

  Update 2017-05-06: TypeScript now supports [gradual migration](https://blogs.msdn.microsoft.com/typescript/2017/04/27/announcing-typescript-2-3/). This makes typescript more compelling in a JS-first world and the //@ts-check comment can be added without any changes to this project.

- What about SharePoint on-prem?

  This starter works with SharePoint 2013 and later. Simply configure the starter to point to your on-prem farm and place the HostWebProxy.aspx in the corresponding document library.
  At this point simply run `npm start` at the command line. There is an NPM scripts for deploying the proxy file to SP On-Prem, execute ```npm run deploy-proxy-sp```
