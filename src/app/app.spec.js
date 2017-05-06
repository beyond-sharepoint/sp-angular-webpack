import app from './app.module.js';

describe('app', () => {

  describe('AppCtrl', () => {
    let appCtrl, httpBackend;

    beforeEach(() => {
      angular.mock.module(app);

      angular.mock.inject(($injector, $controller) => {
        httpBackend = $injector.get('$httpBackend');
        appCtrl = $controller('AppCtrl');

        //Set up handlers
        httpBackend.when('GET', 'http://www.example.com')
          .respond({ foo: "bar" });
      });
    });

    it('should contain the starter url', () => {
      expect(appCtrl.url).toBe('https://github.com/beyond-sharepoint/sp-angular-webpack');
    });

    it('should resolve asyncs', (done) => {
      appCtrl.doStuffAsync().then((result) => {
        expect(result).toBe(42);
        done();
      }, (err) => {
        done.fail(err);
      });
      httpBackend.flush();
    });
  });
});