import './person-picker.css'
import peoplePickerTemplate from './person-picker.aspx'
import _ from 'lodash'

class peoplePickerCtrl {
    constructor($scope, $http, $ngSharePointConfig) {
        this.$scope = $scope;
        this.$http = $http;
        this.siteUrl = $ngSharePointConfig.siteUrl;
        this.searchText = "";
    }

    $onInit() {
        this.mdFloatingLabel = this.mdFloatingLabel || "Person";
        this.mdInputName = this.mdInputName || undefined;
        this.placeholder = this.placeholder || "Select or search for a Person";
        this.noCache = false;

        if (this.groupId) {
            this.groupId = parseInt(this.groupId);
        }
        
        this.ngModel.$render = () => {
            let person = this.ngModel.$viewValue;
            if (person) {
                this.selectedItem = {
                    Description: person.userName,
                    DisplayText: person.displayName,
                    EntityData: {
                        Email: person.emailAddress
                    }
                }
            }
        };

        this.$scope.$watch('ctrl.selectedItem', (value) => {

            if (!value)
                return;

            let person = {
                userName: value.Description,
                emailAddress: value.EntityData.Email,
                displayName: value.DisplayText
            }
            this.ngModel.$setViewValue(person);
        });
    }

    async querySearch(searchText) {
        if (!searchText)
            return [];

        let people = [];
        people = await this.searchForPersonWithClientPeoplePickerWebService(searchText, this.groupId);
        return people;
    }

    /**
     * Uses the SharePoint list REST service to obtain user information.
     * 
     * @param {string} searchText 
     * @returns 
     * 
     * @memberof peoplePickerCtrl
     */
    async searchForPersonRest(searchText) {
        let filter;
        if (searchText) {
            filter = `startswith(Name, '${searchText}') and ContentType eq 'Person'`;
        } else {
            filter = `ContentType eq 'Person'`;
        }

        let response = await this.$http({
            url: this.siteUrl + `_api/web/siteusers`,
            params: {
                '$filter': filter
            }
        });

        return _.get(response, "data.d.results");
    }

    async searchForPersonInGroup(groupName, searchText) {

        let response = await this.$http({
            url: this.siteUrl + `/_api/Web/SiteGroups/GetById({${groupName})/users?$select=Id,Title&$filter=startswith(Title, '${searchText}')`
        });

        return _.get(response, "data.d.results");
    }

    /**
     * Uses the SharePoint ListData REST service to obtain user information.
     * 
     * @param {string} searchText 
     * @returns 
     * 
     * @memberof peoplePickerCtrl
     */
    async searchForPersonListData(searchText) {

        let filter;
        if (searchText) {
            filter = `startswith(Name, '${searchText}') and ContentType eq 'Person'`;
        } else {
            filter = `ContentType eq 'Person'`;
        }

        let response = await this.$http({
            url: this.siteUrl + `/_vti_bin/ListData.svc/UserInformationList`,
            params: {
                '$filter': filter
            }
        });

        return _.get(response, "data.d.results");
    }

    /**
     * Uses the ProcessQuery RPC API to obtain user information
     * 
     * @param {string} searchText
     * @param {number} groupId 
     * @returns
     * 
     * @memberof peoplePickerCtrl
     */
    async searchForPersonWithProcessQuery(searchText, groupId) {

        let response = await this.$http({
            method: "POST",
            url: this.siteUrl + "/_vti_bin/client.svc/ProcessQuery",
            body: this.getPeoplePickerXML(searchText, groupId),
            headers: {
                "Accept": "*/*",
                "Content-Type": "text/xml"
            }
        });

        if (response.data[2]) {
            let result = JSON.parse(response.data[2]);
            return result;
        }

        return [];
    }

    getPeoplePickerXML(searchText, groupId) {
        searchText = searchText || "";
        groupId = groupId || 0;

        return '<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="15.0.0.0" ApplicationName="Javascript Library">\
        <Actions><StaticMethod TypeId="{de2db963-8bab-4fb4-8a58-611aebc5254b}" Name="ClientPeoplePickerSearchUser" Id="0"><Parameters><Parameter TypeId="{ac9358c6-e9b1-4514-bf6e-106acbfb19ce}">\
<Property Name="AllowEmailAddresses" Type="Boolean">true</Property>\
<Property Name="AllowMultipleEntities" Type="Boolean">false</Property>\
<Property Name="AllowOnlyEmailAddresses" Type="Boolean">false</Property>\
<Property Name="AllUrlZones" Type="Boolean">false</Property>\
<Property Name="EnabledClaimProviders" Type="Null" />\
<Property Name="ForceClaims" Type="Boolean">false</Property>\
<Property Name="MaximumEntitySuggestions" Type="Number">30</Property>\
<Property Name="PrincipalSource" Type="Number">15</Property>\
<Property Name="PrincipalType" Type="Number">5</Property>\
<Property Name="QueryString" Type="String">' + searchText + '</Property>\
<Property Name="Required" Type="Boolean">true</Property>\
<Property Name="SharePointGroupID" Type="Number">' + groupId + '</Property>\
<Property Name="UrlZone" Type="Number">0</Property>\
<Property Name="UrlZoneSpecified" Type="Boolean">false</Property>\
<Property Name="Web" Type="Null" />\
<Property Name="WebApplicationID" Type="String">{00000000-0000-0000-0000-000000000000}</Property>\
</Parameter></Parameters></StaticMethod></Actions><ObjectPaths /></Request>';
    }

    /**
     * Uses the ClientPeoplePicker Not-Quite-REST service to obtain user information.
     * 
     * @param {string} searchText 
     * @param {number} groupId 
     * @returns 
     * 
     * @memberof peoplePickerCtrl
     */
    async searchForPersonWithClientPeoplePickerWebService(searchText, groupId) {

        let params = {
            'queryParams': {
                '__metadata': {
                    'type': 'SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters'
                },
                'AllowEmailAddresses': true,
                'AllowMultipleEntities': false,
                'AllUrlZones': false,
                'MaximumEntitySuggestions': 50,
                'PrincipalSource': 15,
                'PrincipalType': 1,
                'QueryString': searchText,
                'Required': false
            }
        };

        if (groupId) {
            params.queryParams.SharePointGroupID = groupId;
        }

        try {
            let response = await this.$http({
                method: "POST",
                url: this.siteUrl + "/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser",
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                body: JSON.stringify(params)
            });

            let result = JSON.parse(response.data.d.ClientPeoplePickerSearchUser);
            return result;
        }
        catch (ex) {
            return [];
        }
    }
}

export default {
    require: {
        ngModel: '^ngModel'
    },
    bindings: {
        mdInputName: '@',
        mdFloatingLabel: '@',
        label: '@',
        placeholder: '@',
        groupId: '@',
        isRequired: '<',
        disabled: '<',
        noCache: '<',
    },
    template: peoplePickerTemplate,
    controller: ['$scope', '$http', '$ngSharePointConfig', peoplePickerCtrl],
    controllerAs: 'ctrl',
}