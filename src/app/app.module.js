import angular from 'angular'
import angularUIRouter from 'angular-ui-router'
import ngSharePoint from './ng-sharepoint/ng-sharepoint.module.js'

import AppCtrl from './AppCtrl.js'
import './app.css';

import spConfig from '../config.json';

const MODULE_NAME = 'app';

angular.module(MODULE_NAME, [
   angularUIRouter,
   ngSharePoint
])
    .component('app', {
        template: require('./app.aspx'),
        controller: AppCtrl,
        controllerAs: 'app'
    })
    .config(['$provide', '$stateProvider', '$locationProvider', '$httpProvider', '$urlRouterProvider', '$compileProvider',
        function ($provide, $stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $compileProvider) {

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|feed|webcal|excel):/);
            $urlRouterProvider.otherwise('/');
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
        }])
    .run(['$location', '$timeout', '$rootScope', function ($location, $timeout, $rootScope, $infopathLiberator) {
        //Kickstart ui-router.

        //Give the impression that we're loading...
        $timeout(function () {
            $rootScope.__applicationIsLoaded = true;
        }, 2500);

        $rootScope.$on('$stateChangeStart', function (e, toState) {

        });

    }]);

    export default MODULE_NAME;