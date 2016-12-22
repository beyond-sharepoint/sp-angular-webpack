<div class="flex-center-column">
    <form class="form-horizontal" class="flex-center">
        <fieldset>
            <div style="padding: 10px;">
                <p>Select a destination document library and file; then press upload.</p>
            </div>
             <div class="form-group">
                <label class="col-sm-3 control-label">Document Library</label>
                <div class="col-sm-6">
                    <ngsp-Document-Library-Picker document-library='sp._documentLibrary'></ngsp-Document-Library-Picker>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-3 control-label">File</label>
                <div class="col-sm-6">
                    <div class="btn btn-primary pull-right" ng-model="file" name="file" ngf-pattern="'image/*'" ngf-accept="'image/*'" ngf-max-size="50MB"
                    ngf-min-height="100" ngf-resize="{width: 100, height: 100}" ngf-select="sp.fileSelected($file)">Select an image</div>
                    <div class="clearfix"></div>
                    <div class="pull-right">
                        Selected File: <i>{{sp._fileName}}</i>
                    </div>
                </div>
            </div>
            <div class="form-group" style="padding-top: 15px;">
                <label class="col-sm-3 control-label"></label>
                <div class="col-sm-6">
                    <button class="btn btn-primary pull-right" data-ng-click="sp.startUpload()" data-ng-disabled="!sp.canUpload()">Upload</button>
                </div>
            </div>
        </fieldset>
    </form>
</div>