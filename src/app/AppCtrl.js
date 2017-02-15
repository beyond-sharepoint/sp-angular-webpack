class AppCtrl {
  constructor() {
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

    //Wrap call to $http in new promise, as $q != Promise
    //Don't return it either
    let response = await new Promise((resolve, reject) => {
      this.$http({
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