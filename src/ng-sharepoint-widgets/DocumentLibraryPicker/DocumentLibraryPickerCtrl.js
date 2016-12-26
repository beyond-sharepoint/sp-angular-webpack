class DocumentLibraryPickerCtrl {
    constructor($http) {
        this.documentLibrary = {};
        this.documentLibraries = [];
        this.$http = $http;
    }

    async $onInit() {
        let response = await this.getDocumentLibraries();
        this.documentLibraries = response.data.d.results;
    }

    async getDocumentLibraries() {
        return this.$http({
            url: this.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 101&$expand=RootFolder"
        });
    };
}

export default DocumentLibraryPickerCtrl