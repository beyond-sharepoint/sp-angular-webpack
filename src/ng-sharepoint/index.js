import angular from 'angular';
import CrossDomainMessageSink from './CrossDomainMessageSink.js'
import ResourceLoader from './ResourceLoader.js'
import FormLibrary from './FormLibrary.js'
import SPContext from './SPContext.js'
import hostWebProxyConfig from '../HostWebProxy.config.json'
import URI from 'urijs';
import _ from 'lodash';

const MODULE_NAME = 'ng-sharepoint';

angular.module(MODULE_NAME, [
])
    .service('$crossDomainMessageSink', [
        '$ngSharePointConfig',
        '$rootScope',
        '$timeout',
        '$resourceLoader',
        CrossDomainMessageSink])
    .service('$resourceLoader', [
        '$document',
        '$timeout',
        ResourceLoader])
    .service('$formLibrary', [
        '$ngSharePointConfig',
        '$window',
        '$crossDomainMessageSink',
        FormLibrary])
    .provider('$ngSharePointConfig', () => {
        let defaults = {
            siteUrl: hostWebProxyConfig.siteUrl,
            proxyUrl: hostWebProxyConfig.proxyUrl || "/Shared%20Documents/HostWebProxy.aspx",
            loginUrl: "/_layouts/15/authenticate.aspx",
            crossDomainMessageSink: {
                outgoingMessageName: "$ngSharePointMessageSink-Outgoing",
                incomingMessageName: "$ngSharePointMessageSink-Incoming",
                createChannelTimeout: 5000
            },
            notAuthorizedMessageName: "$ngSharePointNotAuthorized",
            errorResponseMessageName: "$ngSharePointErrorResponse",
            knownSiteCollections: hostWebProxyConfig.knownSiteCollections || []
        };

        return {
            defaults: defaults,
            $get: () => {
                return defaults;
            }
        };
    })
    .factory('$SPContext', ['$ngSharePointConfig', '$window', '$crossDomainMessageSink',
        ($ngSharePointConfig, $window, $crossDomainMessageSink) => {
            return {
                getContext: (settings) => {
                    return SPContext.getContext(
                        $ngSharePointConfig,
                        $window,
                        $crossDomainMessageSink,
                        settings
                    );
                }
            }
        }])
    .factory('$ngSharePointInterceptor', [
        '$ngSharePointConfig',
        '$window',
        '$crossDomainMessageSink',
        '$rootScope',
        '$q',
        ($ngSharePointConfig, $window, $crossDomainMessageSink, $rootScope, $q) => {

            let requestInterceptor = {
                request: async (config) => {
                    if (!config)
                        return;

                    config.headers = config.headers || {};
                    let configuredSiteUri = URI($ngSharePointConfig.siteUrl).normalize();
                    let requestedSiteUri = URI(config.url).normalize();

                    //If this isn't the origin we're looking for, let it move along.
                    if (configuredSiteUri.origin() !== requestedSiteUri.origin()) {
                        return config;
                    }

                    //Start at the site collection url.
                    let siteCollectionUrl = null;

                    //Iterate through knownSiteCollections, if the http request's url matches, make that the target siteCollection.
                    let knownSiteCollections = $ngSharePointConfig.knownSiteCollections || [];
                    knownSiteCollections.push(configuredSiteUri.path());
                    knownSiteCollections = _.orderBy(knownSiteCollections, null, ['asc']);

                    for (let knownSiteCollection of knownSiteCollections) {

                        let knownFullSiteUrl = URI(knownSiteCollection)
                            .absoluteTo(requestedSiteUri.origin())
                            .normalize()
                            .toString();

                        if (!knownFullSiteUrl.endsWith("/"))
                            knownFullSiteUrl += "/";

                        if (requestedSiteUri.toString().startsWith(knownFullSiteUrl))
                            siteCollectionUrl = knownFullSiteUrl;
                    }

                    if (!siteCollectionUrl) {
                        return config;
                    }

                    //Indicate that we've intercepted this http request.
                    config.__isNgSharePointIntercepted = true;

                    let context = SPContext.getContext(
                        $ngSharePointConfig,
                        $window,
                        $crossDomainMessageSink,
                        siteCollectionUrl
                    );

                    //Change the Accept header to one that returns a JSON response, rather than the odata default.
                    config.headers.Accept = "application/json;odata=verbose";

                    //Bust the cache in IE
                    config.params = config.params || {};
                    config.params.v = (new Date()).getTime();

                    //As fetch doesn't support params, pull in the params and append the url with them.
                    if (config.params) {
                        config.url += (config.url.indexOf('?') === -1 ? '?' : '&') + Object.keys(config.params)
                            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(config.params[k]))
                            .join('&');

                        delete config.params;
                    }

                    let delayedRequest = $q.defer();

                    try {
                        let response = await context.fetch(config);
                        config.response = response;
                        //Short-circuit the original http request
                        config.method = "GET";
                        config.cache = {
                            get: () => {
                                return null;
                            }
                        };
                        delayedRequest.resolve(config);
                    }
                    catch (err) {
                        config.data = err;
                        delayedRequest.reject(config);
                    }

                    return delayedRequest.promise;
                },
                response: (response) => {
                    if (!response.config.__isNgSharePointIntercepted)
                        return response;

                    let finalResponse = {};
                    for (let propertyKey of ["headers", "data", "ok", "result", "status", "statusText", "type", "url"]) {
                        finalResponse[propertyKey] = response.config.response[propertyKey];
                    }
                    finalResponse.config = response.config;

                    //If we have an 'error' status, reject the promise.
                    if (finalResponse.status > 399 && finalResponse.status < 600) {
                        if (finalResponse.status === 401 || finalResponse.status === 403) {
                            $rootScope.$broadcast($ngSharePointConfig.notAuthorizedMessageName, finalResponse);
                        }
                        else {
                            $rootScope.$broadcast($ngSharePointConfig.errorResponseMessageName, finalResponse);
                        }
                        return $q.reject(finalResponse);
                    }

                    return $q.resolve(finalResponse);
                }
            };

            return requestInterceptor;
        }])
    .config(['$httpProvider', ($httpProvider) => {
        $httpProvider.interceptors.push('$ngSharePointInterceptor');
    }])
    .run([
        '$ngSharePointConfig', '$window', '$rootScope',
        (ngSharePointConfig, $window, $rootScope) => {

            /**
             * Listen to messages coming from other windows performing a postMessages and rebroadcast as angular messages.
             */
            angular.element($window).bind('message', (event) => {
                event = event.originalEvent || event;
                if (!event || !event.data || !event.data.postMessageId || !event.data.postMessageId.startsWith("SP.RequestExecutor_"))
                    return;
                
                let response = event.data;
                response.origin = event.origin;

                $rootScope.$root.$broadcast(ngSharePointConfig.crossDomainMessageSink.incomingMessageName, response);
            });
        }
    ]);

export default MODULE_NAME