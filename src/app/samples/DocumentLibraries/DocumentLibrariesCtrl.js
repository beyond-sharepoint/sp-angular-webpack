class DocumentLibrariesCtrl {
    constructor($ngSharePointConfig, $SPContext, $scope, $state, $window, $uibPosition) {
        this.isLoading = true;
        
        this._context = $SPContext($ngSharePointConfig.siteUrl, {
            authenticationReturnSettings: {
                query: {
                    target: $ngSharePointConfig.siteUrl,
                    go: true
                }
            }
        });
        
        var workspace = $window.document.querySelector('#app-workspace-main');
        this.position = $uibPosition.position(workspace);

        this.gridOptions = {
            enableSorting: true,
            columnDefs: [
                { name: 'Title', enableSorting: true, width: 250 },
                { name: 'Description', enableSorting: false, maxWidth: 9000 }
            ],
        };

        let that = this;
        this._context.ensureContext()
            .then(function() {
                return that.getDocumentLibraries();
            })
            .then(function(data) {
                that.gridOptions.data = data.results;
                that.isLoading = false;
                $scope.$apply();
            });
    }

    async getDocumentLibraries() {
        return this._context.fetch({
            url: "/_api/web/Lists?$filter=BaseTemplate eq 101"
        });
    };
}

export default DocumentLibrariesCtrl