import angular from 'angular';

import DocumentLibraryPickerCtrl from './DocumentLibraryPicker/DocumentLibraryPickerCtrl'
import FormsLibraryPickerCtrl from './FormsLibraryPicker/FormsLibraryPickerCtrl'

const MODULE_NAME = 'ng-sharepoint-widgets';

angular.module(MODULE_NAME, [
    'ngSanitize',
    'ui.select'
])
    //Document Library Picker
    .component('ngspDocumentLibraryPicker', {
        template: require('./DocumentLibraryPicker/DocumentLibraryPicker.aspx'),
        controller: ['$http', DocumentLibraryPickerCtrl],
        controllerAs: 'ctrl',
        bindings: {
            siteUrl: '@',
            documentLibrary: '='
        }
    })
    //Forms Library Picker
    .component('ngspFormsLibraryPicker', {
        template: require('./FormsLibraryPicker/FormsLibraryPicker.aspx'),
        controller: ['$http', FormsLibraryPickerCtrl],
        controllerAs: 'ctrl',
        bindings: {
            siteUrl: '@',
            formsLibrary: '='
        }
    })

export default MODULE_NAME