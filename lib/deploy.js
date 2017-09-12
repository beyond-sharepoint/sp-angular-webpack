"use strict";

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const Gauge = require("gauge");
const progress = require("request-progress");
const chalk = require("chalk");
const URI = require("urijs");
const Promise = require("bluebird");
const hanson = require("hanson");
const _ = require("lodash");

const spoRemoteAuth = require("@beyond-sharepoint/spo-remote-auth");
const ntlmRemoteAuth = require("@beyond-sharepoint/ntlm-remote-auth");


//Read Configuration
const configHansonData = fs.readFileSync(path.join(__dirname, "../src/HostWebProxy.config.json"), "utf8");
const hostWebProxyConfig = hanson.parse(configHansonData);

const app = (function () {
    let _config = {};

    const flatten = arr => arr.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val) : val), []);

    Array.prototype.flatten = function () { return flatten(this) };

    /**
     *  Synchronous function to getall files in a folder.
     * @param {targetFolder} dir 
     */
    const walkSync = dir => fs.readdirSync(dir)
        .map(file => fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file))
            : path.join(dir, file).replace(/\\/g, '/')).flatten();

    /**
     * Utility function to retrieve a value from process.env or prompt for it.
     */
    let getConfiguationValue = Promise.coroutine(function* (config, configName, envName, prompt, hideValue) {
        //Use environment variables first.
        config[configName] = process.env[envName];

        if (config[configName] !== undefined) {
            if (!!!hideValue)
                console.log(chalk.cyan(`Using ${configName} from env: ${config[configName]}`));
            else
                console.log(chalk.cyan(`Using ${configName} from env.`));
            return config[configName];
        }

        //If it wasn't there, check the hostWebProxy configuration.
        config[configName] = hostWebProxyConfig[configName];
        if (config[configName]) {
            if (!!!hideValue)
                console.log(chalk.cyan(`Using ${configName} from HostWebProxy.config.json: ${config[configName]}`));
            else
                console.log(chalk.cyan(`Using ${configName} from HostWebProxy.config.json.`));
            return config[configName];
        }

        //Still not found? Prompt for it.
        if (!config[configName]) {
            let answer = yield inquirer.prompt(prompt);
            config[configName] = answer[prompt.name];
        }

        return config[configName];
    });

    /**
     * Initializes configuration by retrieving it from .env, environment or prompting for it.
     */
    let initSPO = Promise.coroutine(function* () {
        yield getConfiguationValue(_config, "siteUrl", "sp_angular_webpack_siteurl", {
            type: 'input',
            message: `Enter the url to your SharePoint Online tenant`,
            name: 'siteUrl'
        });

        yield getConfiguationValue(_config, "proxyUrl", "sp_angular_webpack_proxyurl", {
            type: 'input',
            message: `Enter the relative path to store the proxy file (default is /Shared%20Documents/HostWebProxy.aspx)`,
            default: "/Shared%20Documents/HostWebProxy.aspx",
            name: 'proxyUrl'
        });

        yield getConfiguationValue(_config, "username", "sp_angular_webpack_username", {
            type: 'input',
            message: `Enter the username for ${_config.siteUrl}`,
            name: 'username'
        });

        yield getConfiguationValue(_config, "password", "sp_angular_webpack_password", {
            type: 'password',
            message: `Enter the password for ${_config.siteUrl}`,
            name: 'password'
        }, true);
    });

    let initSP = Promise.coroutine(function* () {
        yield getConfiguationValue(_config, "siteUrl", "sp_angular_webpack_siteurl", {
            type: 'input',
            message: `Enter the url to your SharePoint Online tenant`,
            name: 'siteUrl'
        });

        yield getConfiguationValue(_config, "proxyUrl", "sp_angular_webpack_proxyurl", {
            type: 'input',
            message: `Enter the relative path to store the proxy file (default is /Shared%20Documents/HostWebProxy.aspx)`,
            default: "/Shared%20Documents/HostWebProxy.aspx",
            name: 'proxyUrl'
        });

        yield getConfiguationValue(_config, "workstation", "sp_angular_webpack_workstation", {
            type: 'input',
            message: `Enter the user workstation for ${_config.siteUrl}`,
            default: '',
            name: 'workstation'
        });

        yield getConfiguationValue(_config, "domain", "sp_angular_webpack_domain", {
            type: 'input',
            message: `Enter the user domain for ${_config.siteUrl}`,
            default: '',
            name: 'domain'
        });

        yield getConfiguationValue(_config, "username", "sp_angular_webpack_username", {
            type: 'input',
            message: `Enter the username for ${_config.siteUrl}`,
            name: 'username'
        });

        yield getConfiguationValue(_config, "password", "sp_angular_webpack_password", {
            type: 'password',
            message: `Enter the password for ${_config.siteUrl}`,
            name: 'password'
        }, true);
    });

    let deleteFolder = Promise.coroutine(function* (ctx, fnGetRequest, targetFolderServerRelativeUrl, options) {

        let opts = {
            method: "POST",
            url: URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')`).href(),
            headers: {
                "IF-MATCH": "*",
                "X-HTTP-Method":"DELETE"
            }
        };

        try {
            let request = yield fnGetRequest(ctx, opts);
        } catch(ex) {
            console.dir(ex);
        }

    });

    let createFolder = Promise.coroutine(function* (ctx, fnGetRequest, targetFolderServerRelativeUrl, targetFolderName, options) {
        var body = {
            __metadata: {
                type: 'SP.Folder'
            },
            ServerRelativeUrl: `${targetFolderServerRelativeUrl}/${targetFolderName}`
        };
        
        let opts = {
            method: "POST",
            url: URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')/folders/add(url='${URI.encode(targetFolderName)}')`).href()
        };

        try {
            let request = yield fnGetRequest(ctx, opts);
        } catch(ex) {
            console.dir(ex);
        }
    });

    let uploadFile = Promise.coroutine(function* (ctx, fnGetRequest, localFilePath, targetFolderServerRelativeUrl, targetFilename, options) {

        if (!_.isFunction(fnGetRequest))
            throw new Error("fnGetRequest must be specified and a function.");

        let fileStat = fs.statSync(localFilePath);
        if (!fileStat.isFile())
            throw new Error(`Unable to locate a file at ${localFilePath}`);

        let opts = {
            method: "POST",
            url: URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')/files/add(overwrite=${options.Overwrite}, url='${URI.encode(targetFilename)}')`).href()
        };

        let request = yield fnGetRequest(ctx, opts);

        let gauge = new Gauge({
            updateInterval: 50
        });

        gauge.show(targetFilename, 0)

        let waitPromise = new Promise(function (resolve, reject) {
            let uploadRequest = request;
            uploadRequest.body = fileStat.size === 0 ? "" : fs.readFileSync(localFilePath);

            let result = progress(uploadRequest, {
                throttle: 250
            })
                .on('progress', function (state) {
                    gauge.show(`${targetFilename} : ${(state.percentage * 100).toFixed(2)}%`, state.percentage)
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('end', function () {
                    gauge.hide();
                    gauge.disable();
                    resolve(result);
                });
        });

        try {
            let request = yield waitPromise;
            request.removeAllListeners();

            switch (request.response.statusCode) {
                case 200:
                    console.log(chalk.green(`Done! ${request.headers['content-length']} bytes written to ${targetFolderServerRelativeUrl}${path.sep}${targetFilename}`));
                    break;
                case 400:
                    console.log(chalk.red("The specified file already exists in the target folder. Specify the -o option to overwrite the file."));
                    break;
                default:
                    if (request.response.body && request.response.body.error)
                        console.log(chalk.red(request.response.body.error.message));
                    else
                        console.log(chalk.red(`An error occurred. StatusCode: ${request.response.statusCode}`));
                    break;
            }
        } catch (ex) {
            console.log(ex);
        }
    });

    let self = this;

    /**
   * Internal method to deploy all files within /src/api/ to the target location
   */
    let _deployApi = Promise.coroutine(function* (fnAuthenticate, fnGetRequest) {
        console.log(chalk.cyan(`Connecting to ${_config.siteUrl}...`));
        try {
            let ctx = yield fnAuthenticate();
            console.log(chalk.green(`Connected.`));

            //Ensure that the /oversightdashboard/api folder exists and is empty.

            console.log(chalk.cyan(`Ensuring /api folder exists...`));
            yield deleteFolder(ctx, fnGetRequest, "ofsoversightdashboard/api");
            yield Promise.delay(1000);
            yield createFolder(ctx, fnGetRequest, "ofsoversightdashboard", "api");
            yield Promise.delay(1000);

            //Get the files in the /src/api folder.

            //Iterate over each file and upload them.
            let files = walkSync("./src/api/");
            for (let file of files) {
                var fileInfo = path.parse(file);
                let targetUri = URI(_config.siteUrl)
                    .normalize()
                    .segment("ofsoversightdashboard")
                    .segment("api")
                    .segment(fileInfo.dir.replace("src/api", ""))
                    .segment(fileInfo.base);

                yield createFolder(ctx, fnGetRequest, "ofsoversightdashboard/api", fileInfo.dir.replace("src/api/", ""));
                yield Promise.delay(1000);
                console.log(chalk.cyan(`Uploading ${file} to ${targetUri.toString()}`));
                yield uploadFile(ctx, fnGetRequest, file, URI.decode(targetUri.directory()), URI.decode(targetUri.filename()), { Overwrite: true });
            }

            console.log(chalk.green('All files uploaded!!'));
        }
        catch (ex) {
            if (ex.message === "The entered and stored passwords do not match.") {
                return Promise.reject(chalk.red("The specified password was incorrect."));
            }

            //Unknown error: throw.
            throw ex;
        }
    });

    /**
   * Internal method to deploy the proxy file using a specified request object
   */
    let _deployProxy = Promise.coroutine(function* (fnAuthenticate, fnGetRequest) {
        console.log(chalk.cyan(`Connecting to ${_config.siteUrl}...`));
        try {
            let ctx = yield fnAuthenticate();
            console.log(chalk.green(`Connected.`));

            let targetUri = URI(_config.siteUrl)
                .normalize()
                .segment(_config.proxyUrl);

            console.log(chalk.cyan(`Uploading to ${targetUri.toString()}`));

            return yield uploadFile(ctx, fnGetRequest, "./dist/HostWebProxy.aspx", URI.decode(targetUri.directory()), URI.decode(targetUri.filename()), { Overwrite: true });
        }
        catch (ex) {
            if (ex.message === "The entered and stored passwords do not match.") {
                return Promise.reject(chalk.red("The specified password was incorrect."));
            }

            //Unknown error: throw.
            throw ex;
        }
    });

    /**
   * Deploys API files to SharePoint on-prem.
   */
    let deployApi = Promise.coroutine(function* () {
        let fnAuthenticate = ntlmRemoteAuth.authenticate.bind(self, _config.siteUrl, _config.workstation, _config.domain, _config.username, _config.password);
        let fnGetRequest = function (ctx, options) {
            return ctx.ensureContextInfoAsync()
                .then(function (contextInfo) {

                    _.set(options, "baseUrl", contextInfo.WebFullUrl);
                    _.set(options, "headers.X-RequestDigest", contextInfo.FormDigestValue);

                    return ctx.sendType1MessageAsync(options);
                })
                .then(function (type1Response) {
                    return ctx.sendType3Message(type1Response, options);
                });
        };
        return yield _deployApi(fnAuthenticate, fnGetRequest);
    });

    /**
   * Deploys HostWebProxy to SharePoint on-prem.
   */
    let deployProxySP = Promise.coroutine(function* () {
        let fnAuthenticate = ntlmRemoteAuth.authenticate.bind(self, _config.siteUrl, _config.workstation, _config.domain, _config.username, _config.password);
        let fnGetRequest = function (ctx, options) {
            return ctx.ensureContextInfoAsync()
                .then(function (contextInfo) {

                    _.set(options, "baseUrl", contextInfo.WebFullUrl);
                    _.set(options, "headers.X-RequestDigest", contextInfo.FormDigestValue);

                    return ctx.sendType1MessageAsync(options);
                })
                .then(function (type1Response) {
                    return ctx.sendType3Message(type1Response, options);
                });
        };
        return yield _deployProxy(fnAuthenticate, fnGetRequest);
    });

    /**
   * Deploys HostWebProxy to SharePoint online.
   */
    let deployProxySPO = Promise.coroutine(function* () {
        let fnAuthenticate = spoRemoteAuth.authenticate.bind(self, _config.siteUrl, _config.username, _config.password);
        let fnGetRequest = function (ctx, options) {
            return ctx.ensureContextInfoAsync()
                .then(function (contextInfo) {
                    let defaultSPRequest = ctx.getDefaultRequest({
                        baseUrl: contextInfo.WebFullUrl,
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose",
                            "X-RequestDigest": contextInfo.FormDigestValue,
                            "Cookie": `rtFa=${ctx.accessToken.rtFa}; FedAuth=${ctx.accessToken.FedAuth}`,
                        },
                        json: true
                    });

                    return defaultSPRequest(options);
                });
        };

        return yield _deployProxy(fnAuthenticate, fnGetRequest);
    });

    return {
        initSP,
        initSPO,
        deployApi,
        deployProxySP,
        deployProxySPO
    }
})();

module.exports = app;