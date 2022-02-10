# how to manage server state? - intro to Axios and react-query

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

It's better to show with a real example. I want to refactor ContainersDatatable to use react-query.
ContainersDatatable was converted to react in one of our first react PRs, but it still gets the state from angular. I want to change that and use react-query.

Let's see how it's done right now:

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

### Step 1: add a service function to query the server

_app/docker/containers/containers.service.ts_

```ts
interface Filters {
  label?: string[];
}

export async function getContainers(environmentId: EnvironmentId, all: boolean, filters: Filters) {
  try {
    const response = await axios.get<DockerContainer[]>(urlBuilder(environmentId, undefined, 'json'), {
      params: { all, filters: JSON.stringify(filters) },
    });
    return response.data;
  } catch (error) {
    throw parseAxiosError(error as Error, 'Unable to retrieve containers');
  }
}
```

This function is making a get request (`axios.get`), to the url `/api/endpoints/:environmentId/docker/containers/json`, with the query params `all=${all}&filters=${filtersJson}`. In Portainer everything after `/api/endpoints/:environmentId/docker` is proxied to the docker environment, so `containers/json` is the api to fetch docker containers, and the params are docker's params (so I won't go more in depth about them).

We wrap with try/catch and parse the axios error to something more readable by our error handlers. **This is a subject to revisit, as we're still not sure if this the way we want it**

### Step 2: Create a react-query custom hook

Let's create a queries file, in the future it will include all the queries that are related to containers. I'm still thinking about it, if we need a service file and a query file, or should they be in the same file.

_app/docker/containers/queries.ts_

```ts
import { useQuery } from 'react-query';

import { EnvironmentId } from '@/portainer/environments/types';
import { error as notifyError } from '@/portainer/services/notifications';

import { Filters, getContainers } from './containers.service';

export function useContainers(environmentId: EnvironmentId, all: boolean, filters: Filters) {
  return useQuery(['docker', environmentId, 'containers', { all, filters }], () => getContainers(environmentId, all, filters), {
    onError(err) {
      notifyError('Failure', err as Error, 'Unable to retrieve containers');
    },
  });
}
```

The main `react-query` function (or hook) is `useQuery`. This is where the magic happens. It receives two mandatory arguments - the query key and the fetcher function. The query key is very important, as it will define how the data is cached, and using that react-query will know if it should call the fetcher again or if it can get the data from the server.

You can think about the query key as the dependency array of useEffect. The data (and its state), will change whenever the query key change, so it's important to be specific. The rule of thumb is to have all the parameters you give the fetcher inside of it, and queries can have hierarchy. So the query key above and `['docker', environmentId, 'containers', containerId]` are nested in `['docker', environmentId, 'containers']`, so if I want to refetch both I can invalidate both. As I said before, currently we reload the page to reload data. Using react-query we can just invalidate the page queries for that.

the name "fetcher" is a bit misleading, any async function (i.e a function which returns a Promise) can be used here. For example, think of querying the user's location. But it's mostly used for server fetching functions.

The third argument is the query options. React-query has many of those, I'd suggest checking them in the docs. Here we use the `onError` handler to notify of the error using the toaster. In our codebase you might see already things like:

```ts
const query = useQuery(queryKey, fetcher);

useEffect(() => {
  if (query.isError) {
    notifyError('Failure', query.error as Error, 'Unable to load');
  }
}, [query.isError, query.error]);
```

it's basically the same as above, but cleaner (well, less code). In the near future, we will have an error handler in the QueryClient instance (`app/react-tools/RootProvider.tsx`), so you'll be able to do:

```ts
const query = useQuery(queryKey, fetcher, {
  meta: {
    error: { title: 'Failure', message: 'Unable to load' },
  },
});
```

I think there are a few good approaches to error handling (TODO, link to tkdodo blog post), we can use all of them where it's relevant.

We've already seen that useQuery returns `isError` and `error`, it also returns `isLoading`, `isSuccess`, `isFetching` and more flags (all derived from `status` which is also returned).

With these flags we can check the status of a query. The last is `data` which in our case will be an array of containers.

## Step 3: Use the hook in our component

In my experience, useQuery and useTable (`react-table`) had some problems being in the same component (If you know why, I'd love to hear about it). Lucky for us, we have `ContainersDatatableContainer.tsx`. Yes, I know the name is misleading, with react-query we're getting close to solving the caching problem, so maybe we can have an AI which generates names to components?

In this component we initialize (and load) the table settings, and here we will fetch the dataset and conditionally load the table.

_app/docker/containers/components/ContainersDatatable/ContainersDatatableContainer.tsx_

```ts
export function ContainersDatatableContainer({
  endpoint,
  tableKey = 'containers',
  ...props
}: Props) {

const defaultSettings =....

const containersQuery = useContainers(endpoint.Id);

  if (containersQuery.isLoading || !containersQuery.data) {
    return null;
  }

  return (
    <EnvironmentProvider environment={endpoint}>
      <TableSettingsProvider defaults={defaultSettings} storageKey={tableKey}>
        <SearchBarProvider storageKey={tableKey}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <ContainersDatatable {...props} dataset={containersQuery.data} />
        </SearchBarProvider>
      </TableSettingsProvider>
    </EnvironmentProvider>
  );

```

well, I was surprised to find out that this is it, it's working. Needs a bit of cleaning, but yes, it is that simple.

Let's do something cool. Open one of the running containers in another tab (ctrl+click on one of the containers' names). and stop it (make sure it's not portainer).

Now go back to the containers table, and the container's state will update. Cool, right?! How did it not work like this before?

Ok, you probably just reading and can't see it, I'll try to add a video of it here.

I think this is enough for this post. I'll add another post where we will use `useMutation` and see how to save server state and how to invalidate queries.
