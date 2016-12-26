class DocumentLibraryPickerCtrl {
    constructor($ngSharePointConfig, $http) {
        this.isLoading = false;
        this.documentLibrary = {};
        this.documentLibraries = [];
        this.$http = $http;
        this.siteUrl = $ngSharePointConfig.siteUrl;

        let that = this;
        this.getDocumentLibraries()
            .then(function (response) {
                that.documentLibraries = response.data.d.results;
                that.isLoading = false;
            });
    }

    async getDocumentLibraries() {
        return this.$http({
            url: this.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 101&$expand=RootFolder"
        });
    };
}

export default DocumentLibraryPickerCtrl