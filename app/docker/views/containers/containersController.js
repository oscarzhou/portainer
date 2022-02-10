angular.module('portainer.docker').controller('ContainersController', ContainersController);

/* @ngInject */
function ContainersController($scope, ContainerService, Notifications, endpoint) {
  $scope.offlineMode = endpoint.Status !== 1;
  $scope.endpoint = endpoint;
}
