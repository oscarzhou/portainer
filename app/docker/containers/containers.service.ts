import { EnvironmentId } from '@/portainer/environments/types';
import PortainerError from '@/portainer/error';
import axios, { parseAxiosError } from '@/portainer/services/axios';

import { genericHandler } from '../rest/response/handlers';

import { ContainerId, DockerContainer } from './types';

export interface Filters {
  label?: string[];
}

export async function getContainers(
  environmentId: EnvironmentId,
  all = true,
  filters?: Filters
) {
  try {
    const response = await axios.get<DockerContainer[]>(
      urlBuilder(environmentId, undefined, 'json'),
      {
        params: { all, filters: filters && JSON.stringify(filters) },
      }
    );
    return response.data;
  } catch (error) {
    throw parseAxiosError(error as Error, 'Unable to retrieve containers');
  }
}

export async function startContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(
    urlBuilder(endpointId, id, 'start'),
    {},
    { transformResponse: genericHandler }
  );
}

export async function stopContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, 'stop'), {});
}

export async function restartContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, 'restart'), {});
}

export async function killContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, 'kill'), {});
}

export async function pauseContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, 'pause'), {});
}

export async function resumeContainer(
  endpointId: EnvironmentId,
  id: ContainerId
) {
  await axios.post<void>(urlBuilder(endpointId, id, 'unpause'), {});
}

export async function renameContainer(
  endpointId: EnvironmentId,
  id: ContainerId,
  name: string
) {
  await axios.post<void>(
    urlBuilder(endpointId, id, 'rename'),
    {},
    { params: { name }, transformResponse: genericHandler }
  );
}

export async function removeContainer(
  endpointId: EnvironmentId,
  container: DockerContainer,
  removeVolumes: boolean
) {
  try {
    const { data } = await axios.delete<null | { message: string }>(
      urlBuilder(endpointId, container.Id),
      {
        params: { v: removeVolumes ? 1 : 0, force: true },
        transformResponse: genericHandler,
      }
    );

    if (data && data.message) {
      throw new PortainerError(data.message);
    }
  } catch (e) {
    throw new PortainerError('Unable to remove container', e as Error);
  }
}

function urlBuilder(
  endpointId: EnvironmentId,
  id?: ContainerId,
  action?: string
) {
  let url = `/endpoints/${endpointId}/docker/containers`;

  if (id) {
    url += `/${id}`;
  }

  if (action) {
    url += `/${action}`;
  }

  return url;
}
