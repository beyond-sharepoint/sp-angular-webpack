# sp-angular-webpack-starter

Starter project for creating apps with client-side technologies in SharePoint using Angular and Webpack

###Quick Start

To start developing with SP-Angular-Webpack-Starter you'll need a few things:
First, make sure you've got a recent version of node.js and git installed.

I also recommend VSCode as an editor, but feel free to use whatever editor suits your fancy.

Next, you'll need to clone the sp-angular-webpack repository and install its dependencies.
``` bash
# clone the repo
$ git clone https://github.com/beyond-sharepoint/sp-angular-webpack/my-app

# change directory to your app
$ cd my-app

# install the dependencies with npm
$ npm install
```

Once you have the dependencies installed, let's configure the app to point to your SharePoint tenant.

You can either edit the configuration file located in ./src/HostWebProxy.config.json in a text editor, or use
the convienant built-in confuration tool.
``` bash
$ npm run configure
```

Now, let's deploy the proxy file that enables cross-domain communication to your app. This proxy file is a small >15kb file that lives within
any document library on your SharePoint tenant or on-prem installation. 

If you're deploying to SharePoint Online, the starter comes with a npm run script that facilitates this and automatically uses the
proxyUrl you specified in the configuration above. You'll be prompted for your SharePoint Online credentials.

``` bash
$ npm run deploy-proxy-spo
```

If you're deploying to an on-prem SharePoint farm (or you'd like to perform this step manually),
you can also build the proxy and simply drag and drop it into the target document library.

``` bash
$ npm run build-proxy
```

You'll find a file named 'HostWebProxy.aspx' within the /dist folder. Simply upload this file to the document that was configured above.

> For the two above operations, you'll need at least edit or designer permisions on a target web.
> Specifically you'll need the 'Add and Customize Pages' Permission Level.

Once we've got the proxy uploaded we're ready to go.

Start the local server.
``` bash
$ npm start
```

At this point a browser will be opened to the sample app. When you navigate to a sample that requires authentication
with SharePoint Online, you'll be automatically navigated to the login page and back to the app.

>Additional steps required for on-prem SharePoint.

### Development

Once you get a feel for the starter, browse the code within ./src/app/**/*. 

After you're comfortable with what the starter is doing, using your editor of choice,
go ahead and start changing the starter to fit your needs, after all, the starter is here to
facilitate creating your own app.

With the built-in watcher, any changes you make in your editor will cause the application to automatically reload.

Additionally, you can use any ECMAScript 6+ functionality when your building your app. You'll see examples of this
when browsing the code. The starter automatically transpiles down to ECMAScript 2015 and polyfills anything else in.

Thus, the starter should work on IE10+

### Testing

If you'd like to unit test your app, the starter is configured with karma and uses .spec.js files located in your app. 

To run your unit tests and get code coverage results, simply run:
``` bash
$ npm test
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

macOS:
``` bash
$ export sp_angular_webpack_username=<yourusername>
$ export sp_angular_webpack_password=<yourpassword>
```

use SET on windows.

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
 - [ ] Finish Samples
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
 - [ ] On-Prem Support
    - [ ] Test On-Prem (and document steps!)
    - [ ] Deploy-App-SP (Requires NTLM Auth Lib)
    - [ ] Deploy-Proxy-SP (Requires NTLM Auth Lib)
