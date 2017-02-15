import angular from 'angular'

import DocumentSetsCtrl from './DocumentSetsCtrl'

const MODULE_NAME = 'document-sets-sample';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ng-sharepoint-widgets',
    'ui.bootstrap',
    'ui.router.state',
])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples-document-sets', {
                url: "/samples/document-sets",
                views: {
                    workspaceHeader: {
                        template: require("./header.aspx")
                    },
                    workspaceMain: {
                        template: require("./workspace.aspx"),
                        controller: ['$ngSharePointConfig', '$SPContext', '$scope', '$state', DocumentSetsCtrl],
                        controllerAs: "sp"
                    }
                }
            });
    }]);

export const moduleName = MODULE_NAME
export const definition = {
    sequence: 3,
    name: "Document Sets",
    icon: "fa-file-archive-o",
    description: "Demonstrates document set creation, population and snapshotting.",
    entryState: "samples-document-sets"
};