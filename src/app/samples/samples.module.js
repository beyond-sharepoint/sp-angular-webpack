import angular from 'angular'

import './samples.css'

//Import samples
import DocumentLibrariesCtrl from './DocumentLibraries/DocumentLibrariesCtrl.js'
import FileUploadCtrl from './FileUpload/FileUploadCtrl.js'
import DocumentSetsCtrl from './DocumentSets/DocumentSetsCtrl.js'

const MODULE_NAME = 'samples';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ng-sharepoint-widgets',
    'ui.bootstrap',
    'ui.router.state',
    'ngFileUpload',
    'ui.grid',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns'
])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples', {
                url: "/samples?target&go",
                views: {
                    workspaceHeader: {
                        template: require("./samples-header.aspx")
                    },
                    workspaceMain: {
                        template: require("./samples-workspace.aspx")
                    }
                }
            })
            .state('samples-document-libraries', {
                url: "/samples/document-libraries",
                views: {
                    workspaceHeader: {
                        template: require("./DocumentLibraries/header.aspx")
                    },
                    workspaceMain: {
                        template: require("./DocumentLibraries/workspace.aspx"),
                        controller: ['$ngSharePointConfig', '$SPContext', '$scope', '$state', DocumentLibrariesCtrl],
                        controllerAs: "sp"
                    }
                }
            })
            .state('samples-file-upload', {
                url: "/samples/file-upload",
                views: {
                    workspaceHeader: {
                        template: require("./FileUpload/header.aspx")
                    },
                    workspaceMain: {
                        template: require("./FileUpload/workspace.aspx"),
                        controller: ['$SPContext', '$scope', '$state', FileUploadCtrl],
                        controllerAs: "sp"
                    }
                }
            })
            .state('samples-document-sets', {
                url: "/samples/document-sets",
                views: {
                    workspaceHeader: {
                        template: require("./DocumentSets/header.aspx")
                    },
                    workspaceMain: {
                        template: require("./DocumentSets/workspace.aspx"),
                        controller: ['$ngSharePointConfig', '$SPContext', '$scope', '$state', DocumentSetsCtrl],
                        controllerAs: "sp"
                    }
                }
            });
    }]);

export default MODULE_NAME