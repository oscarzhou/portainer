import angular from 'angular';

import { CreateContainerInstanceViewAngular } from './CreateContainerInstanceView';
import { ContainerInstanceViewAngular } from './ContainerInstanceView';
import { ContainerInstancesViewAngular } from './ContainerInstancesView';

export const containerInstancesModule = angular
  .module('portainer.azure.containerInstances', [])
  .component('containerInstanceView', ContainerInstanceViewAngular)
  .component('createContainerInstanceView', CreateContainerInstanceViewAngular)
  .component('containerInstancesView', ContainerInstancesViewAngular).name;
