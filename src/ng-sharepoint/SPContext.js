"use strict";

const moment = require("moment");
const URI = require("urijs");
const _ = require("lodash");
const SPContexts = {};

const SPWeb = require("./SPWeb.js");

/**
 * Represents a SPContext.
 * 
 * A SPContext is per-site-collection.
 */
class SPContext {
    constructor($window, $crossDomainMessageSink, siteUrl, settings) {
        this.$window = $window;
        this.$crossDomainMessageSink = $crossDomainMessageSink;
        this.siteUrl = siteUrl;
        this.settings = _.defaultsDeep(settings, {
            apiRootPath: "/_api/",
            contextPath: "/_api/contextinfo",
            proxyPath: "/Shared%20Documents/HostWebProxy.aspx",
            loginPath: "/_layouts/15/authenticate.aspx",
            authenticationReturnSettings: {},
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            }
        });

        this.proxyFullPath = URI(siteUrl).pathname(this.settings.proxyPath).normalize().toString();
        this.contextFullPath = URI(siteUrl).pathname(this.settings.contextPath).normalize().toString();
    }

    /**
     * Returns a header object of the default headers defined in the settings plus the X-RequestDigest value.
     * If a headers object is supplied, it is merged with default headers.
     * 
     * @param {any} headers
     * @returns
     */
    getDefaultHeaders(headers) {
        let result = _.cloneDeep(this.settings.headers);
        if (this.contextInfo) {
            result["X-RequestDigest"] = this.contextInfo.FormDigestValue;
        }

        if (headers) {
            _.merge(result, headers);
        }

        return result;
    }

    /**
     * Given an absolute or relative url, returns a url that is site-relative to the current context.
     * 
     * @param {any} siteRelativeUrl
     * @returns
     */
    async getSiteRelativeUrl(siteRelativeUrl) {

        await this.ensureContext();

        let targetUri = URI(siteRelativeUrl);
        if (targetUri.is("absolute"))
            targetUri = targetUri.relativeTo(this.siteUrl);

        return targetUri
            .normalize()
            .toString();
    }

    /**
     * Returns a SPWeb object for the current context.
     */
    async getSPWeb() {

        await this.ensureContext();

        if (!this._web) {
            this._web = new SPWeb(this, this.webUrl);
        }

        return this._web;
    }

    /**
     * Ensures that a current context is active.
     */
    async ensureContext() {
        let channel;

        //Ensure that a SharePoint channel is open. If it times out, redirect to the SharePoint Authentication page.
        try {
            channel = await this.$crossDomainMessageSink.createChannel(this.proxyFullPath);
        }
        catch (ex) {
            //If it's a timeout error, redirect to the login page.
            if (_.isError(ex) && ex.message.startsWith("invoke() timed out")) {
                let sourceUrl;
                if (this.settings.authenticationReturnSettings.source)
                    sourceUrl = URI(this.settings.authenticationReturnSettings.source);
                else
                    sourceUrl = URI(this.$window.location.href);

                if (this.settings.authenticationReturnSettings.query) {
                    sourceUrl.query(this.settings.authenticationReturnSettings.query);
                };

                let authUri = URI(this.siteUrl)
                    .pathname(this.settings.loginUrl)
                    .addQuery("source", sourceUrl)
                    .normalize()
                    .toString();

                this.$window.open(authUri, "_top");

                //Return a promise that won't resolve while this page is navigating.
                return new Promise(function () { });
            }

            //Unknown error -- throw the exception.
            throw ex;
        }

        //If we don't have a context, or it is expired, get a new one.
        if (!this.contextInfo || moment().isAfter(this.contextInfo.expires)) {
            let context = await channel.invoke("Fetch",
                {
                    url: this.contextFullPath,
                    method: "POST",
                    credentials: 'same-origin',
                    headers: this.getDefaultHeaders(),
                    body: "",
                    resultType: "json",
                    cache: false
                });

            let contextInfo = _.get(context, "data.d.GetContextWebInformation");

            if (!contextInfo)
                throw new Error("A connection to the ContextInfo endpoint succeeded, but a result was not returned.");

            this.contextInfo = contextInfo;
            this.contextInfo.expires = moment().add(this.contextInfo.FormDigestTimeoutSeconds, 'seconds');

            //Update the web and site Url based on what we received back from contextinfo.
            this.siteUrl = this.contextInfo.SiteFullUrl;
            this.webUrl = this.contextInfo.WebFullUrl;
        }

        return channel;
    }

    /**
     * Executes http requests through a proxy.
     * @returns promise that resolves with the response.
     */
    async fetch(settings, rawResponse) {

        if (!settings)
            throw "Fetch settings must be supplied as the first argument.";

        let channel = await this.ensureContext();

        if (settings.url) {
            let targetUri = new URI(settings.url);
            if (targetUri.is("relative")) {
                targetUri = targetUri.absoluteTo(this.webUrl);
                settings.url = targetUri.normalize().toString();
            }
        }

        let mergedSettings = _.merge({
            url: this.webUrl,
            method: "GET",
            credentials: 'same-origin',
            headers: this.getDefaultHeaders(),
            resultType: "json",
            cache: false
        }, settings);

        return channel.invoke('Fetch', mergedSettings);
    };

    /**
     * Transfers an array buffer to the proxy.
     * Use this method when large amounts of data need to be used by fetch.
     */
    async transfer(buffer) {
        if (!buffer || Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]')
            throw new Error("An ArrayBuffer must be specified as the first argument.");

        let channel = await this.ensureContext();

        return await channel.transfer(buffer);
    };

    /**
     * Gets or creates a context for a given siteUrl.
     */
    static getContext(config, $window, $crossDomainMessageSink, settings) {
        //Merge some settings with our config.
        settings = _.defaultsDeep(settings, {
            authenticationReturnSettings: {
                source: null,
                query: {}
            },
            siteUrl: config.siteUrl,
            proxyUrl: config.proxyUrl,
            loginUrl: config.loginUrl
        });

        //Ensure that we have a good siteUrl.
        let siteUrl = URI(settings.siteUrl)
            .normalize()
            .toString();

        if (SPContexts[siteUrl])
            return SPContexts[siteUrl];

        var result = new SPContext($window, $crossDomainMessageSink, siteUrl, settings);
        SPContexts[siteUrl] = result;
        return result;
    }
}

export default SPContext;