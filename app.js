import Kinvey from 'kinvey-html5-sdk';

// import frameworks
import desktopUI from 'se-desktop-framework';
import uxJs from 'ux-js';

//import local modules
import Services from './services';
import Layout from './layout';
import Project from './project';
import Settings from './settings';

// import configs
import packageJson from '../package.json';
import layoutTemplate from './layout/layout.html';
import backgroundImg from './assets/woman.png';

const app = angular.module('app', [
  desktopUI.name,
  uxJs.name,
  Services.name,
  Layout.name,
  Project.name,
  Settings.name
]);

app.config((appInfoProvider) => {
  'ngInject';

  appInfoProvider.setInfo({
    title: packageJson.name + 'test',
    subtitle: 'UI Demo',
    version: packageJson.version,
    icon: 'se-icon-lighting',
    backgroundImg: backgroundImg,
    ref: 'APP-ABCDEFGHIJ',
    serial: '12345-67890-12'
  });

  Kinvey.init({
    appKey: 'kid_BkX74IWD',
    appSecret: 'b309b9a43f714f698e4f26dbd4d23382',
    apiHostname: 'https://se-baas.kinvey.com'
  });
})

app.config(['iotConfigProvider' , 'DSPCONST', (iotConfigProvider, DSPCONST) => {
  // configuration of iot services under ux-js component
  let url = 'http://iot-app-api.azurewebsites.net';
  // let url = 'http://localhost:3000';

  iotConfigProvider.setAuth0({
    url : url,
    pathRefreshToken : '/auth/refreshtoken',
    pathToken : '/auth/idtoken'
  });

  iotConfigProvider.setDFLConfig({
    DSPAuth : DSPCONST.AUTH.REMOTE,
    url: url + '/gateway'
  });

  iotConfigProvider.setDBOSConfig({
    DSPAuth : DSPCONST.AUTH.REMOTE,
    url: url + '/gateway'
  })
}])

app.config(['$urlRouterProvider', ($urlRouterProvider) => {
  $urlRouterProvider.otherwise('/app/projectList');
}])

app.config(($stateProvider, $urlRouterProvider, $locationProvider) => {

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    template: layoutTemplate,
    controller: 'LayoutController',
    controllerAs: 'vm',
    resolve: {
      authorize: function(authorization) {
        'ngInject';
        return authorization.authorize();
      }
    }
  });

});

app.run(($log, $rootScope) => {
  'ngInject';

  Kinvey.ping().then((response) => {
    $log.log('Kinvey Ping Success. Kinvey Service is alive, version: ' + response.version + ', response: ' + response.kinvey);
    Kinvey.Log.setLevel(Kinvey.Log.levels.DEBUG);
    //$state.go(state.name);
  }, (error) => {
    $log.log(error)
    $log.log('Kinvey Ping Failed. Response: ' + error.description);
  }
);

});

export default app;
