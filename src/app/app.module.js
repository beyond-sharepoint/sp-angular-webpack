import angular from 'angular'
import angularUIRouter from '@uirouter/angularjs'
import ngSharePoint from '../ng-sharepoint/ng-sharepoint.module.js'

//Import config
import hostWebProxyConfig from '../HostWebProxy.config.json'

//Import Components
import appComponent from './app.component'

import URI from 'urijs';

const MODULE_NAME = 'app';

angular.module(MODULE_NAME, [
    angularUIRouter,
    'angular-loading-bar',
    ngSharePoint
])
    .value('$sharepointBaseUrl', (function () {
        //Do some magic so that if the origin of the proxy url is the same as the current url, assume the site is one step up.
        let targetUri = URI(hostWebProxyConfig.siteUrl);
        let currentUri = URI();
        if (targetUri.origin() === currentUri.origin()) {
            var siteUri = currentUri.segment(-2, "");
            return siteUri.origin() + siteUri.directory();
        }
        //Otherwise, use the configured site url.
        return hostWebProxyConfig.siteUrl;
    })())
    .component('app', appComponent)
    .config(['$provide', '$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider', '$compileProvider', 'cfpLoadingBarProvider',
        function ($provide, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider, cfpLoadingBarProvider) {

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|feed|webcal|excel):/);
            $urlRouterProvider.otherwise('/');

            //Since we're under sharepoint, we cannot use html5mode
            //$locationProvider.html5Mode(true);

            //Some things that improve perf.
            $compileProvider.debugInfoEnabled(false);
            $httpProvider.useApplyAsync(true);

            //initialize get if not there
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }

            cfpLoadingBarProvider.parentSelector = ".app";
            cfpLoadingBarProvider.includeSpinner = false;
        }])
    .run(['$location', '$timeout', '$rootScope', function ($location, $timeout, $rootScope) {
        //Kickstart ui-router.

        //Give the impression that we're loading...
        $timeout(function () {
            $rootScope.__applicationIsLoaded = true;
        }, 500);

        $rootScope.$on('$stateChangeStart', function (e, toState) {

        });
    }]);

export default MODULE_NAME;