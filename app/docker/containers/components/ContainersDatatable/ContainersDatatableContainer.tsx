import { useCurrentStateAndParams } from '@uirouter/react';

import { react2angular } from '@/react-tools/react2angular';
import {
  TableSettingsProvider,
  useTableSettings,
} from '@/portainer/components/datatables/components/useTableSettings';

import { useContainers } from '../../queries';
import { Filters } from '../../containers.service';
import { ContainersTableSettings } from '../../types';

import {
  ContainersDatatable,
  Props as ContainerDatatableProps,
} from './ContainersDatatable';

interface Props extends Omit<ContainerDatatableProps, 'dataset'> {
  filters?: Filters;
}

export function ContainersDatatableContainer({
  environment,
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
    <TableSettingsProvider defaults={defaultSettings} storageKey={tableKey}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ContainersLoader {...props} environment={environment} />
    </TableSettingsProvider>
  );
}

function ContainersLoader({
  filters,
  isRefreshVisible,

  ...props
}: Props) {
  const {
    params: { endpointId },
  } = useCurrentStateAndParams();

  const { settings } = useTableSettings<ContainersTableSettings>();

  const containersQuery = useContainers(
    endpointId,
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
    'environment',
    'isAddActionVisible',
    'filters',
    'isHostColumnVisible',
    'tableKey',
    'isRefreshVisible',
  ]
);
