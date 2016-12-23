"use strict";

const moment = require("moment");
const URI = require("urijs");
const _ = require("lodash");
const SPContexts = {};

const SPWeb = require("./SPWeb.js");

class SPContext {
    constructor($window, $crossDomainMessageSink, webUrl, settings) {
        this.$window = $window;
        this.$crossDomainMessageSink = $crossDomainMessageSink;
        this.webUrl = webUrl;
        this.settings = _.defaultsDeep(settings, {
            apiRootPath: "/_api/",
            contextPath: "/_api/contextinfo",
            proxyPath: "/Shared%20Documents/HostWebProxy.aspx",
            loginPath: "/_layouts/15/authenticate.aspx",
            authenticationReturnParams: null,
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            }
        });

        this.proxyFullPath = (new URI(webUrl)).pathname(this.settings.proxyPath).toString();
        this.contextFullPath = (new URI(webUrl)).pathname(this.settings.contextPath).toString();
    }

    get web() {
        if (!this._web) {
            this._web = new SPWeb(this, this.webUrl);
        }

        return this._web;
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

        let targetUri = new URI(siteRelativeUrl);
        if (targetUri.is("absolute"))
            targetUri = targetUri.relativeTo(this.siteUrl);

        return targetUri.toString();
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
            let sourceUrl;
            if (this.settings.authenticationReturnSettings.source)
                sourceUrl = new URI(this.settings.authenticationReturnSettings.source);
            else
                sourceUrl = new URI(this.$window.location.href);

            if (this.settings.authenticationReturnSettings.query) {
                sourceUrl.query(this.settings.authenticationReturnSettings.query);
            };

            let authUri = new URI(this.webUrl);
            authUri.pathname(this.settings.loginUrl);
            authUri.addQuery("source", sourceUrl);

            this.$window.open(authUri.toString(), "_top");

            //Return a promise that won't resolve while this page is navigating.
            return new Promise(function () { });
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
                throw "A connection to the ContextInfo endpoint succeeded, but a result was not returned.";

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
                settings.url = targetUri.toString();
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

        let response = await channel.invoke('Fetch', mergedSettings);

        if (rawResponse || !response.data)
            return response;

        return response.data.d;
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
     * Gets or creates an context for a given webUrl.
     */
    static getContext(opts) {
        if (!opts.webUrl)
            throw "Web Url must be specified.";

        //Ensure that we have a good weburl.
        let webUri = new URI(opts.webUrl);
        opts.webUrl = webUri.origin();

        if (SPContexts[opts.webUrl])
            return SPContexts[opts.webUrl];

        var result = new SPContext(opts.$window, opts.$crossDomainMessageSink, opts.webUrl, opts.settings);
        SPContexts[opts.webUrl] = result;
        return result;
    }
}

export default SPContext;