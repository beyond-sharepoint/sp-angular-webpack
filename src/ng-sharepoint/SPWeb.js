"use strict";

const moment = require("moment");
const URI = require("urijs");
const _ = require("lodash");

class SPWeb {
    constructor(context, webUrl) {
        this._context = context;
        this._webUrl = webUrl;
    }

    async getListBySiteRelativeUrl(siteRelativeUrl, expand, select) {
        
        siteRelativeUrl = await this._context.getSiteRelativeUrl(siteRelativeUrl);
        let uri = URI.joinPaths("/_api/web/", `getlist('${URI.encode(siteRelativeUrl)}')`);

        if (expand)
            uri.addQuery("$expand", expand);

        if (select)
            uri.addQuery("$select", select);

        return this._context.fetch({
            url: uri.toString()
        });
    };
}

module.exports = SPWeb;