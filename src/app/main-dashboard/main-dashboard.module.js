import angular from 'angular'
import angularMaterial from 'angular-material'
import _ from 'lodash'

import './main-dashboard.css'
import MainDashboardCtrl from './MainDashboardCtrl'

const moduleNames = [
    'ng-sharepoint',
    angularMaterial,
    'ui.router.state',
];

const MODULE_NAME = 'main-dashboard';

angular.module(MODULE_NAME, moduleNames)
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('main-dashboard', {
                url: "/?target&go",
                views: {
                    workspace: {
                        template: require("./workspace.aspx"),
                        controller: [MainDashboardCtrl],
                        controllerAs: "$"
                    }
                }
            })
    }]);

export default MODULE_NAME