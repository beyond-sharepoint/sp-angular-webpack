import angular from 'angular'
import _ from 'lodash'

import './samples.css'
import SamplesCtrl from './SamplesCtrl'

//dynamically load all samples.
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
const modules = requireAll(require.context("./", true, /^\.\/.*?\/.*?\.module\.js$/i));

const moduleNames = [
    'ng-sharepoint',
    'ng-sharepoint-widgets',
    'ui.bootstrap',
    'ui.router.state',
];

const sampleDefinitions = [];

for (module of _.orderBy(modules, ['definition.sequence', 'definition.name'])) {
    moduleNames.push(module.moduleName);
    sampleDefinitions.push(module.definition);
}

const MODULE_NAME = 'samples';

angular.module(MODULE_NAME, moduleNames)
    .constant('$sampleDefinitions', sampleDefinitions)
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples', {
                url: "/samples?target&go",
                views: {
                    workspaceHeader: {
                        template: require("./header.aspx")
                    },
                    workspaceMain: {
                        template: require("./workspace.aspx"),
                        controller: ['$sampleDefinitions', SamplesCtrl],
                        controllerAs: "ctrl"
                    }
                }
            })
    }]);

export default MODULE_NAME