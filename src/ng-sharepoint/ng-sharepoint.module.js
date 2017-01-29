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
    .provider('$ngSharePointConfig', function () {
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
            $get: function () {
                return defaults;
            }
        };
    })
    .factory('$SPContext', ['$ngSharePointConfig', '$window', '$crossDomainMessageSink',
        function ($ngSharePointConfig, $window, $crossDomainMessageSink) {
            return {
                getContext: function (settings) {
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
        function ($ngSharePointConfig, $window, $crossDomainMessageSink, $rootScope, $q) {

            let requestInterceptor = {
                request: function (config) {
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

                    let delayedRequest = $q.defer();

                    let preFetchTasks = [];
                    if (config.body) {
                        let bodyType = Object.prototype.toString.call(config.body);

                        switch (bodyType) {
                            case '[object ArrayBuffer]':
                                //preFetchTasks.push(context.transfer(config.body));
                                preFetchTasks.push(function(){ console.log("xfered"); debugger;})
                                config._useTransferObjectAsBody = true;
                                break;
                            case '[object File]':
                                let convertBlobtoArrayBuffer = new Promise((resolve, reject) => {
                                    let reader = new FileReader();
                                    reader.addEventListener("loadend", function () {
                                        let arrayBuffer = reader.result;
                                        preFetchTasks.push(context.transfer(arrayBuffer));
                                        config._useTransferObjectAsBody = true;
                                        resolve();
                                    });
                                    reader.readAsArrayBuffer(config.body);
                                });
                                preFetchTasks.push(convertBlobtoArrayBuffer);
                                break;
                            default:
                                //Do Nothing.
                                break;
                        }
                    }

                    Promise.all(preFetchTasks)
                        .then(() => context.fetch(config))
                        .then(function (response) {
                            config.response = response;
                            //Short-circuit the original http request
                            config.method = "GET";
                            config.cache = {
                                get: function () {
                                    return null;
                                }
                            };
                            delayedRequest.resolve(config);
                        }, function (errDesc, error) {
                            config.data = errDesc + "|" + error;
                            delayedRequest.reject(config);
                        });

                    return delayedRequest.promise;
                },
                response: function (response) {
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
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('$ngSharePointInterceptor');
    }])
    .run([
        '$ngSharePointConfig', '$window', '$rootScope',
        function (ngSharePointConfig, $window, $rootScope) {

            /**
             * Listen to messages coming from other windows performing a postMessages and rebroadcast as angular messages.
             */
            angular.element($window).bind('message', function (event) {
                event = event.originalEvent || event;
                if (event && event.data) {
                    let response = null;
                    $rootScope.sender = event.source;
                    try {
                        response = angular.fromJson(event.data);
                    } catch (ex) {
                        response = {};
                        response.text = event.data;
                    }
                    response.origin = event.origin;

                    $rootScope.$root.$broadcast(ngSharePointConfig.crossDomainMessageSink.incomingMessageName, response);
                }
            });
        }
    ]);

export default MODULE_NAME