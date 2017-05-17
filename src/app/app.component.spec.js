import appComponent from './app.component';

describe('Main App', () => {

    describe('app component', () => {
        let appCtrl, httpBackend, $timeout;

        beforeEach(() => {
            angular.module('app-mock', [])
                .component('app', appComponent);

            angular.mock.module('app-mock');
            angular.mock.inject(($injector, $componentController) => {
                httpBackend = $injector.get('$httpBackend');
                $timeout = $injector.get('$timeout');
                appCtrl = $componentController('app', {});

                //Set up handlers
                httpBackend.when('GET', 'http://www.example.com')
                    .respond({ foo: "bar" });
            });
        });

        it('should contain the starter url', () => {
            expect(appCtrl.url).toBe('https://github.com/beyond-sharepoint/sp-angular-webpack');
        });

        it('should resolve asyncs', (done) => {

            Promise.try(async () => {
                var result = await appCtrl.doStuffAsync();
                expect(result).toBe(42);
            }).finally(done, done.fail);

            httpBackend.flush();
        });
    });
});