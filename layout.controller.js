import { authentication } from '../services/auth'

export default class LayoutController {
  constructor($log, $rootScope, authentication, $state) {
    'ngInject';

    this.log = $log.log;
    this.$state = $state;

    this.appInfo = {
      title: 'Iot DLite', // the title of your app
      icon: 'se-icon-machines'
    };

    this.submenu = [{
      name: 'Projects', // the title of your app
      state: 'app.projectList',
      match: 'app.project'
    }, {
      name: 'Settings', // the title of your app
      state: 'app.settings.tenants',
      match: 'app.settings'
    }]

    this.subtitle = null;

    // {
    //   name: 'Help', // the title of your app
    //   state: 'app.help.home',
    //   match: 'app.help'
    // }]

    this.userMenu = {
      name: authentication.user().username, // username
      options: [{
        text: 'Logout', // optional when isDivider is true
        click: () => {
          authentication.logout();
        }
      }]
    }

    $rootScope.$on('event:updateProject', (ev, project) => {
      this.log('event:updateProject', project);
      if (project){
        project.state = this.$state.current.name;
        project.params = this.$state.params;

        this.subtitle = {
          text : project.name,
          id : project._id,
          click : () => {
            // console.log(project)
            this.$state.go(project.state, project.params);
          },
          class : 'medium-grey',
          icon : 'se-icon-measurement'
        };
      } else {
        this.subtitle = null;
      }
    })

  }
}
