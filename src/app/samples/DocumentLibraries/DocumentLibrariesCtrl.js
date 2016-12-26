class DocumentLibrariesCtrl {
    constructor($ngSharePointConfig, $http) {
        this.isLoading = true;
        this.$http = $http;
        this.$ngSharePointConfig = $ngSharePointConfig;

        this.gridOptions = {
            enableSorting: true,
            columnDefs: [
                { name: 'Title', enableSorting: true, width: 250 },
                { name: 'Description', enableSorting: false, maxWidth: 9000 }
            ],
        };

        let that = this;

        this.getDocumentLibraries()
            .then(function (response) {
                that.gridOptions.data = response.data.d.results;
                that.isLoading = false;
            });
    }

    async getDocumentLibraries() {
        return this.$http({
            url: this.$ngSharePointConfig.siteUrl + "/_api/web/Lists?$filter=BaseTemplate eq 101"
        });
    };
}

export default DocumentLibrariesCtrl