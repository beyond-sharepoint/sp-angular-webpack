<div class="container" style="overflow-y: auto;">
<h3>Welcome to SharePoint Angular WebPack Samples:</h3>
<h5>Pick a sample to get started:</h5>
<div vs-repeat>
    <div data-ng-repeat="sampleDefinition in ctrl.sampleDefinitions" class="bs-callout bs-callout-info clearfix">
        <h4><a class="no-underline" data-ui-sref="{{sampleDefinition.entryState}}"><span ng-if="sampleDefinition.icon"><i ng-class="'fa ' + sampleDefinition.icon + ' fa-lg'"'></i>&nbsp;&nbsp;</span>{{sampleDefinition.name}}</a></h4>
        <p>{{sampleDefinition.description}}</p>
        <div class="pull-right">
            <button class="btn btn-primary" data-ui-sref="{{sampleDefinition.entryState}}">View</button>
        </div>
    </div>
</div>
</div>