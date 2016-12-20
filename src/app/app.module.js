import angular from 'angular'
import angularUIRouter from 'angular-ui-router'
import ngSharePoint from './ng-sharepoint/ng-sharepoint.module.js'

//Import App styles, controls, etc.
import './app.css';
import AppCtrl from './AppCtrl.js'

//import sub-modules...
import samples from './samples/samples.module.js';

const MODULE_NAME = 'app';

angular.module(MODULE_NAME, [
   angularUIRouter,
   'angular-loading-bar',
   ngSharePoint,
   samples
])
    .controller('AppCtrl', [ AppCtrl ])
    .component('app', {
        template: require('./app.aspx'),
        controller: 'AppCtrl',
        controllerAs: 'app'
    })
    .config(['$provide', '$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider', '$compileProvider', 'cfpLoadingBarProvider',
        function ($provide, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider, cfpLoadingBarProvider) {

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|feed|webcal|excel):/);
            $urlRouterProvider.otherwise('/samples');
            $locationProvider.html5Mode(true);

            //Some things that improve perf.
            $compileProvider.debugInfoEnabled(false);
            $httpProvider.useApplyAsync(true);

            //initialize get if not there
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }

            //disable IE ajax request caching
            //$httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
            //$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            //$httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

            //delete $httpProvider.defaults.headers.common['X-Requested-With'];

            cfpLoadingBarProvider.parentSelector = ".workspace-header";
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