angular.module('portainer.app').factory(
  'EndpointProvider',
  /* @ngInject */
  function EndpointProviderFactory(LocalStorage) {
    const state = {
      currentEndpoint: null,
    };
    var service = {};
    var endpoint = {};

    service.initialize = function () {
      var endpointID = LocalStorage.getEndpointID();

      if (endpointID) {
        endpoint.ID = endpointID;
      }
    };

    service.clean = function () {
      LocalStorage.cleanEndpointData();
      endpoint = {};
    };

    service.endpoint = function () {
      return endpoint;
    };

    service.endpointID = function () {
      if (endpoint.ID === undefined) {
        endpoint.ID = LocalStorage.getEndpointID();
      }

      return endpoint.ID;
    };

    service.setEndpointID = function (id) {
      endpoint.ID = id;
      LocalStorage.storeEndpointID(id);
    };

    service.endpoints = function () {
      return LocalStorage.getEndpoints();
    };

    service.setEndpoints = function (data) {
      LocalStorage.storeEndpoints(data);
    };

    service.currentEndpoint = function () {
      return state.currentEndpoint;
    };

    service.setCurrentEndpoint = function (endpoint) {
      state.currentEndpoint = endpoint;
    };

    return service;
  }
);
