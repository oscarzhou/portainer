angular.module('portainer.docker').controller('ContainersController', ContainersController);

/* @ngInject */
function ContainersController($scope, endpoint) {
  $scope.endpoint = endpoint;
}
