import angular from 'angular';

import DocumentLibraryPickerCtrl from './DocumentLibraryPicker/DocumentLibraryPickerCtrl'

const MODULE_NAME = 'ng-sharepoint-widgets';

angular.module(MODULE_NAME, [
    'ngSanitize',
    'ui.select'
])
    //Document Library Picker
    .component('ngspDocumentLibraryPicker', {
        template: require('./DocumentLibraryPicker/DocumentLibraryPicker.aspx'),
        controller: ['$ngSharePointConfig', '$http', DocumentLibraryPickerCtrl],
        controllerAs: 'ctrl',
        bindings: {
            documentLibrary: '='
        }
    })

export default MODULE_NAME