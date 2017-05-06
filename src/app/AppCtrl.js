class AppCtrl {
  constructor($http) {
    this.$http = $http;
    if (this.$http === undefined)
      throw "mooseballs.";
      
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
    console.log(this.$http);
    console.log("fffoooooo");
    var that = this;
    if (this.$http === undefined)
      throw "asdfasdfasfasdfasdfasdf";

    //Wrap call to $http in new promise, as $q != Promise
    //Don't return it either
    let response = await new Promise((resolve, reject) => {
      that.$http({
        method: "GET",
        url: "http://www.example.com"
      }).then((r) => resolve(r), (err) => reject(err));
    });

    //second awaited call -- again, don't await on $timeout
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(42);
      }, 1000);
    });
  }
}

export default AppCtrl