
import projectModal from './projectModal.html';
import startModal from './startModal.html';
import _ from 'lodash';

export default class ProjectListController {
  constructor($scope, $log, $timeout, $uibModal, ProjectStore, TenantStore, $state) {
    'ngInject';

    this.title = 'Dashboard';
    this.$timeout = $timeout;
    this.scope = $scope;
    this.log = $log.log;
    this.uibModal = $uibModal;
    this.ProjectStore = ProjectStore;
    this.TenantStore = TenantStore;
    this.projects = [];
    this.$state = $state;

    $scope.$emit('event:updateProject', null)


    this.getProjects();
    this.getTenants();
  }

  getProjects() {
    this.log('getProjects')

    let stream = this.ProjectStore.getAll();
    stream.subscribe((projects) => {
      this.log('projects', projects)
      this.$timeout(() => {
        this.projects = projects;
      });
      this.getTenants();
    }, (error) => {
      this.log(error);
    });
  }

  getTenants() {
    let stream = this.TenantStore.getAll();
    stream.subscribe((tenants) => {
      this.$timeout(() => {
        this.tenants = tenants;
      });
    }, (error) => {
      this.log(error);
    }, () => {
      if(this.tenants && this.tenants.length === 0 ) {

        // Check for skip on popup
        let skip = localStorage.getItem('skipStart');
        if(!skip || skip !== 'true') {
          let modalInstance = this.uibModal.open({
            template: startModal,
            controller: 'StartModalController',
            bindToController : true,
            controllerAs: 'vm'
          });
          modalInstance.result.then(() => {
            this.$state.go('app.settings.tenants')
          }, () => {
            this.log('Modal dismissed at: ' + new Date());
          });
        }
      }
    });
  }

  openProject(project){

    let route = '';
    if(_.find(project.tenants, {service : 'DBOS'})){
      route = 'app.project.device.topology'
    } else {
      route = 'app.project.storage.series'
    }
    this.$state.go(route, {project : project._id});

  }

  add() {
    let modalInstance = this.uibModal.open({
      template: projectModal,
      controller: 'ProjectModalController',
      bindToController : true,
      controllerAs: 'vm',
      resolve: {
        tenants: () => {
          return this.tenants;
        },
        action: () => {
          return 'add';
        }
      }
    });
    modalInstance.result.then((project) => {
      var promise = this.ProjectStore.save(project);
      promise.then((entity) => {
        this.projects.push(entity);
        this.scope.$apply();
      }).catch((error) => {
        this.log(error);
      });
    }, () => {
      this.log('Modal dismissed at: ' + new Date());
    });

  }

  delete(_id) {
    var promise = this.ProjectStore.deleteById(_id);
    promise.then((result) => {
      this.getProjects();
    }).catch(function onError(error) {
      this.log.error(error);
    });
  }
}
