class FileUploadCtrl {
    constructor($ngSharePointConfig, $SPContext, $scope, $state) {
        this.$ngSharePointConfig = $ngSharePointConfig;
        this.$SPContext = $SPContext;
        this.$scope = $scope;
        this.$state = $state;

        this._fileName = "No File Selected."
    }

    fileSelected(file) {
        if (!file) {
            this._fileName = "No File Selected.";
            this._buffer = undefined;
            return;
        }

        //Convert the Blob to an arraybuffer.
        let self = this;
        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
            self._buffer = reader.result;
        });

        this._fileName = file.$ngfName;
        reader.readAsArrayBuffer(file);
    }

    canUpload() {
        if (!this._buffer)
            return false;
        return true;
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

        await this._context.transfer(this._buffer);
        console.log("ok");
        this._buffer = undefined;
        this._fileName = "No File Selected.";
        this.$scope.$apply();
    }
}

export default FileUploadCtrl