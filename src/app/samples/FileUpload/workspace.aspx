<div class="flex-center-column">
    <div data-ng-if="ctrl.isUploading">
        <div class="flex-center">
            Uploading&nbsp;<b>{{ctrl._fileName}}</b>&nbsp;to&nbsp;<b>{{ctrl._documentLibrary.selected.RootFolder.ServerRelativeUrl }}</b>
        </div>
        <div class="flex-center">
            <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>
        </div>
    </div>
    <form class="form-horizontal" data-ng-if="!ctrl.isUploading">
        <fieldset>
            <div class="workspace-intro">
                <p>Select a destination document library and file then press upload.</p>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">Document Library</label>
                <div class="col-sm-6">
                    <ngsp-Document-Library-Picker site-url="{{ctrl.siteUrl}}" document-library='ctrl._documentLibrary'></ngsp-Document-Library-Picker>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">File</label>
                <div class="col-sm-6">
                    <div class="btn btn-primary pull-right" ng-model="file" name="file" ngf-pattern="'image/*'" ngf-accept="'image/*'" ngf-max-size="100MB"
                        ngf-min-height="100" ngf-select="ctrl.fileSelected($file)">Select an image</div>
                    <div class="clearfix"></div>
                    <div class="pull-right">
                        <div data-ng-if="ctrl.selectedFile">
                            <div><i>{{ctrl.selectedFile.name}}</i></div>
                            <div class="pull-right"><i>({{ctrl.selectedFile.size | number}}&nbsp;bytes)</i></div>
                        </div>
                        <div data-ng-if="!ctrl.selectedFile">
                            <i>No File Selected</i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group form-action">
                <label class="col-sm-3 control-label"></label>
                <div class="col-sm-6">
                    <button class="btn btn-primary pull-right" data-ng-click="ctrl.startUpload()" data-ng-disabled="!ctrl.canUpload()">Upload</button>
                </div>
            </div>
        </fieldset>
    </form>
</div>