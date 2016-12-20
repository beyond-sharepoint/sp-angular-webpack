import angular from 'angular';
import CrossDomainMessageSink from './CrossDomainMessageSink.js'
import ResourceLoader from './ResourceLoader.js'
import FormLibrary from './FormLibrary.js'
import SPContext from './SPContext.js'
import hostWebProxyConfig from '../../HostWebProxy.config.json'

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
    .factory('$SPContext', ['$ngSharePointConfig', '$window', '$crossDomainMessageSink',
        function (config, $window, $crossDomainMessageSink) {

            return function (webUrl, settings) {

                //Merge some settings with our config.
                _.defaultsDeep(settings, {
                    authenticationReturnSettings: {
                        source: null,
                        query: {}
                    },
                    proxyUrl: config.proxyUrl,
                    loginUrl: config.loginUrl
                });

                return SPContext.getContext({
                    $window,
                    $crossDomainMessageSink,
                    webUrl,
                    settings
                });
            };
        }])
    .provider("$ngSharePointConfig", function () {
        let defaults = {
            siteUrl: hostWebProxyConfig.siteUrl,
            proxyUrl: hostWebProxyConfig.proxyUrl ? hostWebProxyConfig.proxyUrl : "/_layouts/15/AppWebProxy.aspx",
            loginUrl: "/_layouts/15/authenticate.aspx",
            crossDomainMessageSink: {
                outgoingMessageName: "$ngSharePointMessageSink-Outgoing",
                incomingMessageName: "$ngSharePointMessageSink-Incoming",
                createChannelTimeout: 5000
            }
        };

        return {
            defaults: defaults,
            $get: function () {
                return defaults;
            }
        };
    })
    .run([
        '$ngSharePointConfig', '$window', '$rootScope',
        function (ngSharePointConfig, $window, $rootScope) {

            /**
             * Listen for angular broadcast messages that indicate that a message should be sent to the target iFrame.
             * */
            $rootScope.$on(ngSharePointConfig.crossDomainMessageSink.outgoingMessageName, function (event, message, targetOrigin) {
                if (!targetOrigin) {
                    targetOrigin = hostWebProxyConfig.siteUrl;
                }

                if (!targetOrigin) {
                    targetOrigin = "*";
                }

                let sender = $rootScope.sender || $window.parent;
                return sender.postMessage(message, targetOrigin);
            });

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