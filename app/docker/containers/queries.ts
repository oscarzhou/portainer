import { useQuery } from 'react-query';

import { EnvironmentId } from '@/portainer/environments/types';
import { error as notifyError } from '@/portainer/services/notifications';

import { Filters, getContainers } from './containers.service';

export function useContainers(
  environmentId: EnvironmentId,
  all = true,
  filters?: Filters,
  autoRefreshRate?: number
) {
  return useQuery(
    ['docker', environmentId, 'containers', { all, filters }],
    () => getContainers(environmentId, all, filters),
    {
      onError(err) {
        notifyError('Failure', err as Error, 'Unable to retrieve containers');
      },
      refetchInterval() {
        if (autoRefreshRate) {
          return autoRefreshRate;
        }

        return false;
      },
    }
  );
}
