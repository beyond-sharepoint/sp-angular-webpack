import app from './app.module.js';

describe('app', () => {

  describe('AppCtrl', () => {
    let ctrl, httpBackend;

    beforeEach(() => {
      angular.mock.module(app);

      angular.mock.inject(($injector, $controller) => {
        ctrl = $controller('AppCtrl', {});

        httpBackend = $injector.get('$httpBackend');

        //Set up handlers
        httpBackend.when('GET', 'http://www.example.com')
          .respond({ foo: "bar" });
      });
    });

    it('should contain the starter url', () => {
      expect(ctrl.url).toBe('https://github.com/beyond-sharepoint/sp-angular-webpack');
    });

    it('should resolve asyncs', (done) => {
      ctrl.doStuffAsync().then((result) => {
        expect(result).toBe(42);
        done();
      }, (err) => {
        done.fail(err);
      });
      httpBackend.flush();
    });
  });
});