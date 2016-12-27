import angular from 'angular'

import FileUploadCtrl from './FileUploadCtrl'

const MODULE_NAME = 'file-upload-sample';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ng-sharepoint-widgets',
    'ui.bootstrap',
    'ui.router.state',
    'ngFileUpload',
])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('samples-file-upload', {
                url: "/samples/file-upload",
                views: {
                    workspaceHeader: {
                        template: require("./header.aspx")
                    },
                    workspaceMain: {
                        template: require("./workspace.aspx"),
                        controller: ['$ngSharePointConfig', '$http', FileUploadCtrl],
                        controllerAs: "ctrl"
                    }
                }
            })
    }]);

export const moduleName = MODULE_NAME
export const definition = {
    sequence: 2,
    name: "File Upload",
    description: "Demonstrates a file upload operation using a transferable ArrayBuffer for large file uploads.",
    entryState: "samples-file-upload"
};