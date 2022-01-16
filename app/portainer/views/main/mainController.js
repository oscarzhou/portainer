angular.module('portainer.app').controller('MainController', [
  '$scope',
  'LocalStorage',
  'StateManager',
  'ThemeManager',
  function ($scope, LocalStorage, StateManager, ThemeManager) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;
    $scope.getWidth = function () {
      return window.innerWidth;
    };

    $scope.applicationState = StateManager.getState();

    $scope.$watch($scope.getWidth, function (newValue) {
      if (newValue >= mobileView) {
        const toggleValue = LocalStorage.getToolbarToggle();
        $scope.toggle = typeof toggleValue === 'boolean' ? toggleValue : true;
      } else {
        $scope.toggle = false;
      }
    });

    $scope.toggleSidebar = function () {
      $scope.toggle = !$scope.toggle;
      LocalStorage.storeToolbarToggle($scope.toggle);
    };

    window.onresize = function () {
      $scope.$apply();
    };

    ThemeManager.autoTheme();
  },
]);
