import template from './document-library-picker.aspx'
import _ from 'lodash';

class DocumentLibraryPickerCtrl {
    constructor($scope, $http, $ngSharePointConfig) {
        this.$scope = $scope;
        this.$http = $http;
        this.siteUrl = $ngSharePointConfig.siteUrl;

        this.documentLibrary = {};
        this.documentLibraries = [];
    }

    async $onInit() {
        this.documentLibraries = await this.getDocumentLibraries();

        this.$scope.$watch('ctrl.documentLibrary.selected', (value) => {
            this.ngModel.$setViewValue(value);
        });
    }

    async getDocumentLibraries() {
        let response = await this.$http({
            url: this.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 101&$expand=RootFolder"
        });

        return _.get(response, 'data.d.results');
    };
}

export default {
    require: {
        ngModel: '^ngModel'
    },
    template: template,
    controller: ['$scope', '$http', '$ngSharePointConfig', DocumentLibraryPickerCtrl],
    controllerAs: 'ctrl'
}