import { react2angular } from '@/react-tools/react2angular';
import { EnvironmentProvider } from '@/portainer/environments/useEnvironment';
import {
  TableSettingsProvider,
  useTableSettings,
} from '@/portainer/components/datatables/components/useTableSettings';
import type { Environment } from '@/portainer/environments/types';

import { useContainers } from '../../queries';
import { Filters } from '../../containers.service';
import { ContainersTableSettings } from '../../types';

import {
  ContainersDatatable,
  Props as ContainerDatatableProps,
} from './ContainersDatatable';

interface Props extends Omit<ContainerDatatableProps, 'dataset'> {
  endpoint: Environment;
  filters?: Filters;
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

  return (
    <EnvironmentProvider environment={endpoint}>
      <TableSettingsProvider defaults={defaultSettings} storageKey={tableKey}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ContainersLoader {...props} endpoint={endpoint} />
      </TableSettingsProvider>
    </EnvironmentProvider>
  );
}

function ContainersLoader({
  endpoint,
  filters,
  isRefreshVisible,
  ...props
}: Props) {
  const { settings } = useTableSettings<ContainersTableSettings>();

  const containersQuery = useContainers(
    endpoint.Id,
    true,
    filters,
    isRefreshVisible ? settings.autoRefreshRate * 1000 : undefined
  );

  if (containersQuery.isLoading || !containersQuery.data) {
    return null;
  }

  return (
    <ContainersDatatable
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      dataset={containersQuery.data}
      isRefreshVisible={isRefreshVisible}
    />
  );
}

export const ContainersDatatableAngular = react2angular(
  ContainersDatatableContainer,
  [
    'endpoint',
    'isAddActionVisible',
    'filters',
    'isHostColumnVisible',
    'tableKey',
    'isRefreshVisible',
  ]
);
