# how to manage server state? - intro to Axios and react-query

- the problem and how it was solved with angularjs
- how we call the api using axios
- how we can use it with react-query, to query and mutate

Like any big app, Portainer has a lot of state from which most of it is loaded from the server. We have some local state, like table settings, but that's just the minority part of the state. Managing state is a problem that every app has to deal with. With angular, we can use the $http service to make requests to the server, and those we call in a specific feature service, that is called by a controller and persisted to the controller state. When a user refreshes the page, the state is reloaded. When a user creates a new object, we reload the page to reload the state.

React has a lot of state management solutions, like redux, relay, mobx, etc. Most of them define a global state and a way to access it. Most are not handling the loading, just the data, while the developer needs to send the request to the server and handle the response, and manage loading and error states. The user also needs to manage caching and other pitfalls of managing state. In those solutions we would put out table settings and other local state also in the state.

Instead, we chose react-query, a library that focuses on server state (or async state), that handles caching, retry, loading, error states, and so on. Similarly, it doesn't call the server, it just wraps the call.

So, first.

## How to call the API

To call the server we use a library called axios. It's a very popular library which was [based](https://github.com/axios/axios#credits) on angular's $http service. There's not much to say about it, the api is similar to $http, so it's quite easy to move from our own service to ones based on axios.

We're still researching the best way to use it together with react-query, but for now we're going in a similar way as we did for angular.

For each feature, we will have `feature/feature.service.ts` file (or `feature/feature.service` folder if you want to break it into smaller files). Some features will have `feature/services/sub-feature-a.service.ts`, but that's not as important right now.

```ts
import axios, { parseAxiosError } from '@/portainer/services/axios';

export async function getResourceList() {
  try {
    const response = await axios.get<Resource[]>(buildUrl());
    return response.data;
  } catch (error) {
    throw parseAxiosError(error);
  }
}

export async function getResource(id: ResourceId) {
  try {
    const response = await axios.get<Resource>(buildUrl(id));
    return response.data;
  } catch (error) {
    throw parseAxiosError(error);
  }
}

export async function createResource(resource: Resource) {
  try {
    await axios.post(buildUrl(), resource);
  } catch (error) {
    throw parseAxiosError(error);
  }
}

export async function deleteResource(id: ResourceId) {
  try {
    await axios.delete(buildUrl(id));
  } catch (error) {
    throw parseAxiosError(error);
  }
}

function buildUrl(id?: ResourceId) {
  let url = '/api/resource';

  if (id) {
    url += `/${id}`;
  }

  return url;
}
```

This is just the default functions, of course you can change those however you want or need.

You can see that I didn't export a class (not even a static class). This is because each function here isn't dependent on the functions. They also don't have any state. It's just a utility file. I usually prefer this structure because it's easier to understand and it's easier to test. (For testing, we will have a post about async testing)

Also, I didn't import axios from `axios` (i.e `import axios from 'axios'`), because we have some basic setup made for us in `@/portainer/services/axios.ts` (interceptors, baseUrl...).

## Let's prepare our example

It's better to show with a real example. I want to refactor ContainersDatatable to use react-query, instead of getting its state from the angular view. Let's see how it's done right now:

_app/docker/views/containers/containersController.js_

```js
function ContainersController($scope, ContainerService, Notifications, endpoint) {
  $scope.offlineMode = endpoint.Status !== 1;
  $scope.endpoint = endpoint;

  $scope.getContainers = getContainers;

  function getContainers() {
    ContainerService.containers(1)
      .then(function success(data) {
        $scope.containers = data;
      })
      .catch(function error(err) {
        Notifications.error('Failure', err, 'Unable to retrieve containers');
        $scope.containers = [];
      });
  }

  function initView() {
    getContainers();
  }

  initView();
}
```

There are many bad practices here ($scope for example), but let's focus on loading the data.

When the controller is mounted `initView` is called and it calls `getContainers`. `getContainers` calls the ContainerService to load the data, and binds the response data to the scope (or notifies on error).

This is the part the we care about in ContainerService:

_app/docker/services/containerService.js_

```js
service.containers = function (all, filters) {
  var deferred = $q.defer();
  Container.query({ all: all, filters: filters })
    .$promise.then(function success(data) {
      var containers = data.map(function (item) {
        return new ContainerViewModel(item);
      });
      deferred.resolve(containers);
    })
    .catch(function error(err) {
      deferred.reject({ msg: 'Unable to retrieve containers', err: err });
    });

  return deferred.promise;
};
```

Same, the container service calls another service called `Container`, that does the actual call to the server. It doesn't matter exactly what happens there, because we're going to refactor it. The important part is just to understand how we do server state management right now, and see how it will be after the refactor.

We already have a container.service.ts file ready, let's add `getContainers` function to it.

\*app/docker/containers/containers.service.ts()

```ts
interface Filters {
  label?: string[];
}

export async function getContainers(environmentId: EnvironmentId, all: boolean, filters: Filters) {
  try {
    const response = await axios.get<DockerContainer[]>(urlBuilder(environmentId), {
      params: { all, filters: JSON.stringify(filters) },
    });
    return response.data;
  } catch (error) {
    throw parseAxiosError(error as Error, 'Unable to retrieve containers');
  }
}
```
