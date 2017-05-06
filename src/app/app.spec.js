import app from './app.module.js';

describe('app', () => {

  describe('AppCtrl', () => {
    let appCtrl, httpBackend;

    beforeEach(() => {
      angular.mock.module(app);

      angular.mock.inject(($injector, $controller) => {
        appCtrl = $controller('AppCtrl');
      });
    });

    it('should contain the starter url', () => {
      expect(appCtrl.url).toBe('https://github.com/beyond-sharepoint/sp-angular-webpack');
    });
  });
});