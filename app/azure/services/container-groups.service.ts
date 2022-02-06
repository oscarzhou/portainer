import { EnvironmentId } from '@/portainer/environments/types';
import axios, { parseAxiosError } from '@/portainer/services/axios';

import { ContainerGroup, ContainerInstanceFormValues } from '../types';

export async function createContainerGroup(
  model: ContainerInstanceFormValues,
  environmentId: EnvironmentId,
  subscriptionId: string,
  resourceGroupName: string
) {
  const payload = transformToPayload(model);
  try {
    const { data } = await axios.put<ContainerGroup>(
      buildUrl(environmentId, subscriptionId, resourceGroupName, model.name),
      payload,
      { params: { 'api-version': '2018-04-01' } }
    );
    return data;
  } catch (e) {
    throw parseAxiosError(e as Error);
  }
}

export async function getContainerGroups(
  environmentId: EnvironmentId,
  subscriptionId: string
) {
  try {
    const { data } = await axios.get<{ value: ContainerGroup[] }>(
      buildUrl(environmentId, subscriptionId),
      { params: { 'api-version': '2018-04-01' } }
    );

    return data.value;
  } catch (e) {
    throw parseAxiosError(e as Error, 'Unable to retrieve container groups');
  }
}

export async function getContainerGroup(
  environmentId: EnvironmentId,
  subscriptionId: string,
  resourceGroupName: string,
  containerGroupName: string
) {
  try {
    const { data } = await axios.get<ContainerGroup>(
      buildUrl(
        environmentId,
        subscriptionId,
        resourceGroupName,
        containerGroupName
      ),
      { params: { 'api-version': '2018-04-01' } }
    );

    return data;
  } catch (e) {
    throw parseAxiosError(e as Error);
  }
}

export async function deleteContainerGroup(
  environmentId: EnvironmentId,
  containerGroupId: string
) {
  try {
    await axios.delete(`/endpoints/${environmentId}/azure${containerGroupId}`, {
      params: { 'api-version': '2018-04-01' },
    });
  } catch (e) {
    throw parseAxiosError(e as Error, 'Unable to remove container group');
  }
}

function buildUrl(
  environmentId: EnvironmentId,
  subscriptionId: string,
  resourceGroupName?: string,
  containerGroupName?: string
) {
  let url = `/endpoints/${environmentId}/azure/subscriptions/${subscriptionId}`;

  if (resourceGroupName) {
    url += `/resourceGroups/${resourceGroupName}`;
  }

  url += `/providers/Microsoft.ContainerInstance/containerGroups`;

  if (containerGroupName) {
    url += `/${containerGroupName}`;
  }

  return url;
}

function transformToPayload(model: ContainerInstanceFormValues) {
  const containerPorts = [];
  const addressPorts = [];

  const ports = model.ports.filter((p) => p.container && p.host);

  for (let i = 0; i < ports.length; i += 1) {
    const binding = ports[i];

    containerPorts.push({
      port: binding.container,
    });

    addressPorts.push({
      port: binding.host,
      protocol: binding.protocol,
    });
  }

  return {
    location: model.location,
    properties: {
      osType: model.os,
      containers: [
        {
          name: model.name,
          properties: {
            image: model.image,
            ports: containerPorts,
            resources: {
              requests: {
                cpu: model.cpu,
                memoryInGB: model.memory,
              },
            },
          },
        },
      ],
      ipAddress: {
        type: model.allocatePublicIP ? 'Public' : 'Private',
        ports: addressPorts,
      },
    },
  };
}
