import Promise from 'bluebird'

/**
 * Represents an object that dynamically loads resources into the current page. For instance, iframe content, javascript and css.
 */
class ResourceLoader {
    constructor($document, $timeout) {
        this.$document = $document[0];
        this.$timeout = $timeout;

        this._promises = {};

        /**
         * Internal method used to load resources in a generic manner.
         * @param url The url of the resource to load dynamically
         * @param createElement a custom function that performs the actual resource loading for a given dom element.
         * @returns {*} Promise that will be resolved once the resource has been loaded.
         */
        this._loader = function (url, createElement) {

            if (this._promises[url])
                return this._promises[url];

            let resolve, reject;
            let promise = new Promise(function () {
                resolve = arguments[0];
                reject = arguments[1];
            });
            let element = createElement(url);

            element.onload = element.onreadystatechange = function (e) {
                if (element.readyState && element.readyState !== 'complete' && element.readyState !== 'loaded') {
                    return;
                }

                $timeout(function () {
                    resolve(e);
                });
            };

            element.onerror = function (e) {
                $timeout(function () {
                    reject(e);
                });
            };

            return this._promises[url] = promise;
        };
    }

    /**
     * Dynamically loads an iframe pointed to the specifed source url
     * @param src The url of the iframe to load dynamically
     * @param sandbox If specified, indicates that the iframe is a sandbox with the indicated restictions.
     * @returns {*} Promise that will be resolved once the iframe has been loaded.
     */
    loadIFrame(src, sandbox) {
        let self = this;
        return this._loader(src, function () {
            let iframe = self.$document.createElement('iframe');

            iframe.src = src;
            iframe.height = 0;
            iframe.width = 0;
            iframe.tabindex = -1;
            iframe.style="display: none;";
            
            if (sandbox)
                iframe.sandbox = sandbox;

            self.$document.body.appendChild(iframe);
            return iframe;
        });
    }

    /**
     * Dynamically loads the given script
     * @param src The url of the script to load dynamically
     * @returns {*} Promise that will be resolved once the script has been loaded.
     */
    loadScript(src) {
        let self = this;

        return this._loader(src, function () {
            let script = self.$document.createElement('script');

            script.src = src;

            self.$document.body.appendChild(script);
            return script;
        });
    }

    /**
     * Dynamically loads the given CSS file
     * @param href The url of the CSS to load dynamically
     * @returns {*} Promise that will be resolved once the CSS file has been loaded.
     */
    loadCSS(href) {
        let self = this;

        return this._loader(href, function () {
            let style = self.$document.createElement('link');

            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = href;

            self.$document.head.appendChild(style);
            return style;
        });
    }
}

export default ResourceLoader;