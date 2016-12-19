import angular from 'angular'

import './samples.css'

//Import samples
import DocumentLibrariesCtrl from './DocumentLibraries/DocumentLibrariesCtrl.js'
import FileUploadCtrl from './FileUpload/FileUploadCtrl.js'
import DocumentSetsCtrl from './DocumentSets/DocumentSetsCtrl.js'

const MODULE_NAME = 'samples';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ui.bootstrap',
    'ui.router.state',
    'ui.grid',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns'
])
    .controller('DocumentLibrariesCtrl', ['$ngSharePointConfig', '$SPContext', '$scope', '$state', '$window', '$uibPosition', DocumentLibrariesCtrl])
    .controller('FileUploadCtrl', ['$ngSharePointConfig', '$SPContext', '$scope', '$state', FileUploadCtrl])
     .controller('DocumentSetsCtrl', ['$ngSharePointConfig', '$SPContext', '$scope', '$state', DocumentSetsCtrl])
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
                        controller: "DocumentLibrariesCtrl as sp"
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
                        controller: "FileUploadCtrl as sp"
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
                        controller: "DocumentSetsCtrl as sp"
                    }
                }
            });
    }]);

export default MODULE_NAME