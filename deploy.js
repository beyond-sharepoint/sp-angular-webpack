"use strict";

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const Gauge = require("gauge");
const progress = require("request-progress");
const chalk = require("chalk");
const URI = require("urijs");
const Promise = require("bluebird");
require("bluebird-co");

const spoRemoteAuth = require("@beyond-sharepoint/spo-remote-auth");
const hostWebProxyConfig = require("./src/HostWebProxy.config.json");

const app = (function () {
    let _config = {};

    /**
     * Utility function to retrieve a value from process.env or prompt for it.
     */
    let getConfiguationValue = Promise.coroutine(function* (config, configName, envName, prompt, hideValue) {
        //Use environment variables first.
        config[configName] = process.env[envName];
        
        if (config[configName]) {
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
    let init = Promise.coroutine(function* () {
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

    let uploadFile = Promise.coroutine(function*(ctx, localFilePath, targetFolderServerRelativeUrl, targetFilename, options) {

        let opts = {
            method: "POST",
            url: URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')/files/add(overwrite=${options.Overwrite}, url='${URI.encode(targetFilename)}')`).href()
        };

        var gauge = new Gauge({
            updateInterval: 50
        });

        gauge.show(targetFilename, 0)

        let waitPromise = new Promise(function(resolve, reject) {
             let fileBuffer =  fs.readFileSync(localFilePath);
             let uploadRequest = ctx.request(opts);
             uploadRequest.body = fileBuffer;

             let result = progress(uploadRequest, {
                 throttle: 250
             })
                .on('progress', function(state) {
                    gauge.show(`${targetFileName} : ${(state.percentage * 100).toFixed(2)}%`, state.percentage)
                })
                .on('error', function(err) {
                    reject(err);
                })
                .on('end', function() {
                    gauge.hide();
                    gauge.disable();
                    resolve(result);
                });
        });

        try {
            let request = yield waitPromise;
            request.removeAllListeners();

            switch(request.response.statusCode) {
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
        } catch(ex) {
            console.log(ex);
        }
    });

    /**
   * Deploys HostWebProxy to SharePoint online.
   */
    let deployProxySPO = Promise.coroutine(function* () {
        console.log(chalk.cyan(`Connecting to ${_config.siteUrl}...`));
        try {
            let ctx = yield spoRemoteAuth.authenticate(_config.siteUrl, _config.username, _config.password);
            console.log(chalk.green(`Connected.`));
            
            let targetUri = new URI(_config.siteUrl);
            targetUri.path(_config.proxyUrl);

            console.log(chalk.cyan(`Uploading to ${targetUri.toString()}`));

            yield uploadFile(ctx, "./dist/HostWebProxy.aspx", targetUri.directory(), targetUri.filename(), { Overwrite: true });

            return ctx;
        }
        catch (ex) {
            if (ex.message === "The entered and stored passwords do not match.") {
                return Promise.reject(chalk.red("The specified password was incorrect."));
            }

            //Unknown error: throw.
            throw ex;
        }
    });

    return {
        init,
        deployProxySPO
    }
})();

module.exports = app;