import URI from 'urijs'

class FileUploadCtrl {
    constructor($ngSharePointConfig, $SPContext, $scope, $state) {
        this.$ngSharePointConfig = $ngSharePointConfig;
        this.$SPContext = $SPContext;
        this.$scope = $scope;
        this.$state = $state;

        this.isProcessingImage = false;
        this.isUploading = false;
    }

    fileSelecting() {
        this.isProcessingImage = true;
    }

    fileSelected(file) {
        if (!file) {
            this._buffer = undefined;
            this.isProcessingImage = false;
            return;
        }

        //Convert the Blob to an arraybuffer.
        let self = this;
        let reader = new FileReader();
        reader.addEventListener("loadend", function () {
            self._buffer = reader.result;
            self.isProcessingImage = false;
            self.$scope.$apply();
        });

        //Note: If the file is resized using ngf-resize, the filename property is $ngfName
        this._fileName = file.name;
        this._fileSize = file.size
        reader.readAsArrayBuffer(file);
    }

    canUpload() {
        return this._buffer && this._documentLibrary && this._documentLibrary.selected
    }

    async startUpload() {
        this._context = this.$SPContext(this.$ngSharePointConfig.siteUrl, {
            authenticationReturnSettings: {
                query: {
                    target: this.$ngSharePointConfig.siteUrl,
                    go: true
                }
            }
        });

        let targetFilename = this._fileName;
        let targetFolderServerRelativeUrl = this._documentLibrary.selected.RootFolder.ServerRelativeUrl;
        let overwrite = true;

        this.isUploading = true;

        //Transfer the ArrayBuffer to the iFrame context.
        await this._context.transfer(this._buffer);

        //upload to SharePoint using the ArrayBuffer.
        let result = await this._context.fetch({
            _useTransferObjectAsBody: true,
            method: "POST",
            url: URI.joinPaths(`/_api/web/getfolderbyserverrelativeurl('${URI.encode(targetFolderServerRelativeUrl)}')/files/add(overwrite=${overwrite},url='${URI.encode(targetFilename)}')`).href()
        });

        //We could probably do something with the result...

        this._buffer = undefined;
        this.isUploading = false;
        this.$scope.$apply();
    }
}

export default FileUploadCtrl