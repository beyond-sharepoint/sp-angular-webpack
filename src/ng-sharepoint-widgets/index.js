import angular from 'angular';

import uibDocumentLibraryPicker from './uib-document-library-picker/document-library-picker.component'
import uibFormsLibraryPicker from './uib-forms-library-picker/forms-library-picker.component'
import mdPersonPicker from './md-person-picker/person-picker.component'

import URI from 'urijs';

const MODULE_NAME = 'ng-sharepoint-widgets';

angular.module(MODULE_NAME, [
    'ng-sharepoint',
    'ngSanitize',
    'ui.select'
])
    .component('uibDocumentLibraryPicker', uibDocumentLibraryPicker)
    .component('uibFormsLibraryPicker', uibFormsLibraryPicker)
    .component('mdPersonPicker', mdPersonPicker);

export default MODULE_NAME