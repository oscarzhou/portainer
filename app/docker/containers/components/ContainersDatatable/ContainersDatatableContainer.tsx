import { react2angular } from '@/react-tools/react2angular';
import { EnvironmentProvider } from '@/portainer/environments/useEnvironment';
import { TableSettingsProvider } from '@/portainer/components/datatables/components/useTableSettings';
import type { Environment } from '@/portainer/environments/types';

import { useContainers } from '../../queries';

import {
  ContainersDatatable,
  Props as ContainerDatatableProps,
} from './ContainersDatatable';

interface Props extends ContainerDatatableProps {
  endpoint: Environment;
}

export function ContainersDatatableContainer({
  endpoint,
  tableKey = 'containers',
  ...props
}: Props) {
  const defaultSettings = {
    autoRefreshRate: 0,
    truncateContainerName: 32,
    hiddenQuickActions: [],
    hiddenColumns: [],
    pageSize: 10,
    sortBy: { id: 'state', desc: false },
  };

  const containersQuery = useContainers(endpoint.Id);

  if (containersQuery.isLoading || !containersQuery.data) {
    return null;
  }

  return (
    <EnvironmentProvider environment={endpoint}>
      <TableSettingsProvider defaults={defaultSettings} storageKey={tableKey}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ContainersDatatable {...props} dataset={containersQuery.data} />
      </TableSettingsProvider>
    </EnvironmentProvider>
  );
}

export const ContainersDatatableAngular = react2angular(
  ContainersDatatableContainer,
  [
    'endpoint',
    'isAddActionVisible',
    'dataset',
    'onRefresh',
    'isHostColumnVisible',
    'tableKey',
  ]
);
