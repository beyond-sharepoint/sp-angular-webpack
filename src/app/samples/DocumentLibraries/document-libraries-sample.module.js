import angular from 'angular'

import DocumentLibrariesCtrl from './DocumentLibrariesCtrl'

const MODULE_NAME = 'document-libraries-sample';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ui.bootstrap',
    'ui.router.state',
    'ui.grid',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns'
])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples-document-libraries', {
                url: "/samples/document-libraries",
                views: {
                    workspaceHeader: {
                        template: require("./header.aspx")
                    },
                    workspaceMain: {
                        template: require("./workspace.aspx"),
                        controller: ['$ngSharePointConfig', '$http', DocumentLibrariesCtrl],
                        controllerAs: "ctrl"
                    }
                }
            })
    }]);

export const moduleName = MODULE_NAME
export const definition = {
    sequence: 1,
    name: "Document Libraries",
    icon: "fa-beer",
    description: "Demonstrates a simple interaction with SharePoint to retrieve and display Document Libraries contained in the site collection.",
    entryState: "samples-document-libraries"
};