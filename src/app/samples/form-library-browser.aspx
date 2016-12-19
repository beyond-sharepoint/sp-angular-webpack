<div class="container">
    <form class="form-horizontal" name="enterUrlForm">
        <div class="form-group" ng-class="{ 'has-error': enterUrlForm.formLibraryUrl.$invalid}">
            <label for="formLibraryUrl" class="col-sm-2 control-label">Form Library:</label>
            <div class="col-sm-10">
                <input name="formLibraryUrl" class="form-control" type="url" placeholder="Please enter the url of your Forms Library..."
                    data-ng-model="$home.infoPathFormLibraryUrl" required/>
                <div class="pull-right">
                    <div class="text-danger" data-ng-if="$home.errorMessage">{{$home.errorMessage}}</div>
                    <button class="btn btn-primary pull-right" data-ng-click="$home.fetchForms()" data-ng-disabled="enterUrlForm.$invalid || $home.isLoading">
                    <span data-ng-if="$home.isLoading"><i class="fa fa-spin fa-spinner" ></i></span>
                    <span data-ng-if="!$home.isLoading">Show Forms</span>
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>