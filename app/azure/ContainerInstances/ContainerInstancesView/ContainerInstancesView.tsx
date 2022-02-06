import { useMutation, useQueryClient } from 'react-query';

import { useContainerGroups, useSubscriptions } from '@/azure/queries';
import { deleteContainerGroup } from '@/azure/services/container-groups.service';
import { ContainerGroup } from '@/azure/types';
import { TableSettingsProvider } from '@/portainer/components/datatables/components/useTableSettings';
import { PageHeader } from '@/portainer/components/PageHeader';
import { useEnvironmentId } from '@/portainer/hooks/useEnvironmentId';
import { notifyError, notifySuccess } from '@/portainer/services/notifications';
import { r2a } from '@/react-tools/react2angular';
import { EnvironmentId } from '@/portainer/environments/types';
import { promiseSequence } from '@/portainer/helpers/promise-utils';

import { ContainersDatatable } from './ContainersDatatable';
import { TableSettings } from './types';

export function ContainerInstancesView() {
  const defaultSettings: TableSettings = {
    pageSize: 10,
    sortBy: { id: 'state', desc: false },
  };

  const tableKey = 'containergroups';

  const environmentId = useEnvironmentId();

  const subscriptionsQuery = useSubscriptions(environmentId);

  const groupsQuery = useContainerGroups(
    environmentId,
    subscriptionsQuery.data,
    subscriptionsQuery.isSuccess
  );

  const { handleRemove } = useRemoveMutation(environmentId);

  if (groupsQuery.isLoading || subscriptionsQuery.isLoading) {
    return null;
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Container instances' }]}
        reload
        title="Container list"
      />
      <TableSettingsProvider defaults={defaultSettings} storageKey={tableKey}>
        <ContainersDatatable
          tableKey={tableKey}
          dataset={groupsQuery.containerGroups}
          onRemoveClick={handleRemove}
        />
      </TableSettingsProvider>
    </>
  );
}

function useRemoveMutation(environmentId: EnvironmentId) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    async (containerGroups: ContainerGroup[]) => {
      try {
        await promiseSequence(
          containerGroups.map(
            (group) => () => deleteContainerGroup(environmentId, group.id)
          )
        );
      } catch (err) {
        notifyError(
          'Failure',
          err as Error,
          'Unable to remove container groups'
        );
      }
    }
  );

  return { handleRemove };

  async function handleRemove(groups: ContainerGroup[]) {
    deleteMutation.mutate(groups, {
      onSuccess: () => {
        notifySuccess('Container groups successfully removed');
        queryClient.invalidateQueries([
          'azure',
          environmentId,
          'subscriptions',
        ]);
      },
    });
  }
}

export const ContainerInstancesViewAngular = r2a(ContainerInstancesView, []);
