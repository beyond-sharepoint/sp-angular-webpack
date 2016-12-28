class FormsLibraryPickerCtrl {
    constructor($http) {
        this.formsLibrary = {};
        this.formsLibraries = [];
        this.$http = $http;
    }

    async $onInit() {
        let response = await this.getFormsLibraries();
        this.formsLibraries = response.data.d.results;
    }

    async getFormsLibraries() {
        return this.$http({
            url: this.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 115&$expand=RootFolder"
        });
    };
}

export default FormsLibraryPickerCtrl