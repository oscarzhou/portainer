import angular from 'angular';
import { StateRegistry } from '@uirouter/angularjs';

import { TeamsViewAngular } from './TeamsView';

export default angular
  .module('portainer.app.teams', [])
  .config(config)
  .component('teamsView', TeamsViewAngular).name;

/* @ngInject */
function config($stateRegistryProvider: StateRegistry) {
  $stateRegistryProvider.register({
    name: 'portainer.teams',
    url: '/teams',
    views: {
      'content@': {
        component: 'teamsView',
      },
    },
  });

  $stateRegistryProvider.register({
    name: 'portainer.teams.team',
    url: '/:id',
    views: {
      'content@': {
        templateUrl: './angularjs/views/edit/team.html',
        controller: 'TeamController',
      },
    },
  });
}
