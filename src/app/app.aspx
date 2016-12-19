<div class="app">
    <nav class="aside-left-nav">
        <a title class="aside-item logo">
            <div class="logomark">
                <img src="/images/logo.png" alt="Beyond SharePoint" title="Beyond SharePoint - Do more with less. Any platform, any device."></img>
            </div>
        </a>
        <a data-ng-repeat="workspace in app.workspaces" title class="aside-item" data-ui-sref="{{::workspace.state}}" uib-tooltip="{{::workspace.title}}"
            tooltip-placement="right" tooltip-class="aside-tooltip">
            <i class="{{workspace.itemClass}}"></i>
        </a>
    </nav>
    <main class="app-main">
        <div class="workspace-header" data-ui-view="workspaceHeader">
        </div>
        <div id="app-workspace-main" class="workspace-main" data-ui-view="workspaceMain">
        </div>
    </main>
</div>