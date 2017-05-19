<div>
    <ui-select ng-model="ctrl.documentLibrary.selected" theme="bootstrap">
        <ui-select-match placeholder="Select or search for a document library...">
            <div ng-if="$select.selected">
                <img ng-src="{{ctrl.siteUrl + $select.selected.ImageUrl}}" style="vertical-align: baseline"/>
                <span style="padding-left: 5px;">{{$select.selected.Title}}&nbsp;<small>({{$select.selected.RootFolder.ServerRelativeUrl}})</small></span>
            </div>
        </ui-select-match>
        <ui-select-choices repeat="item in ctrl.documentLibraries | filter: $select.search">
            <div>
                <img ng-src="{{ctrl.siteUrl + item.ImageUrl}}"/>
                <span style="padding-left: 5px;" ng-bind-html="item.Title | highlight: $select.search"></span>&nbsp;<small>({{item.RootFolder.ServerRelativeUrl}})</small>
            </div>
            <small>
                <span data-ng-if="item.Description" ng-bind="item.Description"></span>
                <span data-ng-if="!item.Description"><i>No Description</i></span>
            </small>
        </ui-select-choices>
    </ui-select>
</div>