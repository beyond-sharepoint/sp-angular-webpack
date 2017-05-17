import './app.css';
import appTemplate from './app.aspx';

class AppCtrl {
  constructor($http, $timeout) {
    this.$http = $http;
    this.$timeout = $timeout;

    this.url = 'https://github.com/beyond-sharepoint/sp-angular-webpack';
    this.workspaces = [
      {
        title: "Home",
        rootState: "samples",
        state: "samples",
        itemClass: "fa fa-home fa-lg"
      }
    ];
  }

  async doStuffAsync() {

    let response = await this.$http({
      method: "GET",
      url: "http://www.example.com"
    });

    return await Promise.resolve(42);
  }
}

export default {
    template: appTemplate,
    controller: ['$http', '$timeout', AppCtrl],
    controllerAs: 'app'
}