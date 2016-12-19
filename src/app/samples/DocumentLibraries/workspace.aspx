<div class="flex-center">
    <div class="flex-center-column" data-ng-if="sp.isLoading">
        <div class="flex-center">Loading document libraries...</div>
        <div class="flex-center"><i class="fa fa-spin fa-spinner fa-4x"></i></div>
    </div>
    <div data-ng-if="!sp.isLoading" class="forms-grid">
        <div data-ui-grid="sp.gridOptions" class="forms-grid" data-ui-grid-auto-resize="" data-ui-grid-resize-columns="" data-ui-grid-move-columns=""></div>
     </div>
</div>