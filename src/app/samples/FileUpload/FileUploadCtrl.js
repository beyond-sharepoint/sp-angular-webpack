import URI from 'urijs'

class FileUploadCtrl {
    constructor($ngSharePointConfig, $http) {
        this.$http = $http;
        this.$ngSharePointConfig = $ngSharePointConfig;
        this.siteUrl = $ngSharePointConfig.siteUrl;

        this.isUploading = false;
    }

    fileSelected(file) {
        if (!file) {
            this.selectedFile = undefined;
            return;
        }
        this.selectedFile = file;
    }

    canUpload() {
        return this.selectedFile && this._documentLibrary && this._documentLibrary.selected
    }

    async startUpload() {

        //Note: If the file is resized using ngf-resize, the filename property is $ngfName
        let targetFilename = this.selectedFile.name;
        let targetFolderServerRelativeUrl = this._documentLibrary.selected.RootFolder.ServerRelativeUrl;
        let overwrite = true;

        this.isUploading = true;

        await this.$http({
            method: "POST",
            url: this.$ngSharePointConfig.siteUrl + URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')/files/add(overwrite=${overwrite},url='${URI.encode(targetFilename)}')`).href(),
            body: this.selectedFile
        });

        //We could probably do something with the result...

        this.selectedFile = undefined;
        this.isUploading = false;
    }
}

export default FileUploadCtrl