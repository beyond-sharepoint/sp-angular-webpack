class DocumentLibraryPickerCtrl {
  constructor($ngSharePointConfig, $SPContext, $scope) {
      this.isLoading = false;
      this.documentLibrary = {};
      this.documentLibraries = [];
      this.siteUrl = $ngSharePointConfig.siteUrl;
      
      this._context = $SPContext.getContext();

        this.$scope = $scope;

        let that = this;
        this._context.ensureContext()
            .then(function() {
                return that.getDocumentLibraries();
            })
            .then(function(data) {
                that.documentLibraries = data.results;
                that.isLoading = false;
                $scope.$apply();
            });
  }

  async getDocumentLibraries() {
        return this._context.fetch({
            url: "/_api/web/Lists?$filter=BaseTemplate eq 101&$expand=RootFolder"
        });
    };
}

export default DocumentLibraryPickerCtrl