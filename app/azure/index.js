import angular from 'angular';

import { AzureSidebarAngular } from './AzureSidebar/AzureSidebar';
import { DashboardViewAngular } from './Dashboard/DashboardView';
import { containerInstancesModule } from './ContainerInstances';

export const azureModule = angular
  .module('portainer.azure', ['portainer.app', containerInstancesModule])
  .config(config)
  .component('azureSidebar', AzureSidebarAngular)
  .component('dashboardView', DashboardViewAngular).name;

/* @ngInject */
function config($stateRegistryProvider) {
  const azure = {
    name: 'azure',
    url: '/azure',
    parent: 'endpoint',
    abstract: true,
    onEnter: /* @ngInject */ function onEnter($async, $state, endpoint, EndpointProvider, Notifications, StateManager) {
      return $async(async () => {
        if (endpoint.Type !== 3) {
          $state.go('portainer.home');
          return;
        }
        try {
          EndpointProvider.setEndpointID(endpoint.Id);
          EndpointProvider.setEndpointPublicURL(endpoint.PublicURL);
          EndpointProvider.setOfflineModeFromStatus(endpoint.Status);
          await StateManager.updateEndpointState(endpoint);
        } catch (e) {
          Notifications.error('Failed loading environment', e);
          $state.go('portainer.home', {}, { reload: true });
        }
      });
    },
  };

  const containerInstances = {
    name: 'azure.containerinstances',
    url: '/containerinstances',
    views: {
      'content@': {
        component: 'containerInstancesView',
      },
    },
  };

  const containerInstance = {
    name: 'azure.containerinstances.container',
    url: '/:id',
    views: {
      'content@': {
        component: 'containerInstanceView',
      },
    },
  };

  const containerInstanceCreation = {
    name: 'azure.containerinstances.new',
    url: '/new/',
    views: {
      'content@': {
        component: 'createContainerInstanceView',
      },
    },
  };

  const dashboard = {
    name: 'azure.dashboard',
    url: '/dashboard',
    views: {
      'content@': {
        component: 'dashboardView',
      },
    },
  };

  $stateRegistryProvider.register(azure);
  $stateRegistryProvider.register(containerInstances);
  $stateRegistryProvider.register(containerInstance);
  $stateRegistryProvider.register(containerInstanceCreation);
  $stateRegistryProvider.register(dashboard);
}
