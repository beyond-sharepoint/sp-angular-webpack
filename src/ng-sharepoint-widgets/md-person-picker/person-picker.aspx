<div>
    <md-autocomplete
        md-input-name="{{ctrl.mdInputName}}"
        md-no-cache="ctrl.noCache"
        md-selected-item="ctrl.selectedItem"
        md-search-text-change="ctrl.searchTextChange(ctrl.searchText)"
        md-search-text="ctrl.searchText"
        md-selected-item-change="ctrl.selectedPersonChange(ctrl.selectedItem)"
        md-items="item in ctrl.querySearch(ctrl.searchText)"
        md-item-text="item.DisplayText"
        md-min-length="0"
        md-floating-label="{{ctrl.mdFloatingLabel}}"
        md-require-match
        md-menu-class="md-people-picker"
        ng-disabled="ctrl.disabled"
        ng-placeholder="{{ctrl.placeholder}}"
        ng-model-options="{ debounce: 500 }"
        ng-required="{{ctrl.isRequired}}"
    >
        <md-item-template>
            <span class="item-title">
                    <i class="fa fa-user" aria-hidden="true"></i>
                    <span><strong>{{item.DisplayText}}</strong></span>
            </span>
            <span class="item-person-title">
                    <span>
                        Title: <i>{{item.EntityData.Title || "No Title"}}</i>
                    </span>
            </span>
            <span class="item-person-email">
                    Email Address: <i>{{item.EntityData.Email || "None"}}</i>
            </span>
        </md-item-template>
        <md-not-found>
            <span ng-if="!ctrl.searchText">
                Please enter one or more characters to search for people.
            </span>
            <span ng-if="ctrl.searchText">
                No people matching "{{ctrl.searchText}}" were found.
            </span>
        </md-not-found>
    </md-autocomplete>
</div>