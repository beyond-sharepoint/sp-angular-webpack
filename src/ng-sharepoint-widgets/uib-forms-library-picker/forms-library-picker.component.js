import template from './forms-library-picker.aspx'
import _ from 'lodash'

class FormsLibraryPickerCtrl {
    constructor($scope, $http, $ngSharePointConfig) {
        this.$scope = $scope;
        this.$http = $http;
        this.siteUrl = $ngSharePointConfig.siteUrl;

        this.formsLibrary = {};
        this.formsLibraries = [];
    }

    async $onInit() {
        this.formsLibraries = await this.getFormsLibraries();
        
        this.$scope.$watch('ctrl.formsLibrary.selected', (value) => {
            this.ngModel.$setViewValue(value);
        });
    }

    async getFormsLibraries() {
        let response = await this.$http({
            url: this.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 115&$expand=RootFolder"
        });

        return _.get(response, 'data.d.results');
    };
}

export default {
    require: {
        ngModel: '^ngModel'
    },
    template: template,
    controller: ['$scope', '$http', '$ngSharePointConfig', FormsLibraryPickerCtrl],
    controllerAs: 'ctrl'
}