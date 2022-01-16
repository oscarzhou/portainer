angular.module('portainer.app').factory('EndpointProvider', EndpointProvider);

/* @ngInject */
function EndpointProvider() {
  const state = {
    currentEndpoint: null,
  };

  return { endpointID, setCurrentEndpoint, currentEndpoint, clean };

  function endpointID() {
    return state.currentEndpoint && state.currentEndpoint.Id;
  }

  function setCurrentEndpoint(endpoint) {
    state.currentEndpoint = endpoint;
  }

  function currentEndpoint() {
    return state.currentEndpoint;
  }

  function clean() {
    state.currentEndpoint = null;
  }
}
