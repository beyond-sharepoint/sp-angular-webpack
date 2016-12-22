<div class="flex-center-column">
    <div class="flex-center">
        <p>Select a destination document library and image then press upload.</p>
    </div>
    <div class="flex-center">
        <div class="btn btn-primary" ng-model="file" name="file" ngf-pattern="'image/*'" ngf-accept="'image/*'" ngf-max-size="50MB"
            ngf-min-height="100" ngf-resize="{width: 100, height: 100}" ngf-select="sp.fileSelected($file)">Select an image</div>
    </div>
    <div class="flex-center">
        Selected File: <i>{{sp._fileName}}</i>
    </div>
    <div>
        <br/><br/>
        <div class="pull-right clearfix">
            <button class="btn btn-primary" data-ng-click="sp.startUpload()" data-ng-disabled="!sp.canUpload()">Upload</button>
        </div>
    </div>
</div>