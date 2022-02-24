import { react2angular } from '@/react-tools/react2angular';
import {
  TableSettingsProvider,
  useTableSettings,
} from '@/portainer/components/datatables/components/useTableSettings';

import { Filters } from '../../containers.service';
import { ContainersTableSettings } from '../../types';
import { useContainers } from '../../queries';

import {
  ContainersDatatable,
  Props as ContainerDatatableProps,
} from './ContainersDatatable';

interface Props extends Omit<ContainerDatatableProps, 'containers'> {
  filters?: Filters;
}

export function ContainersDatatableContainer({
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
      <ContainersLoader {...props} />
    </TableSettingsProvider>
  );
}

function ContainersLoader({
  environment,
  filters,
  isRefreshVisible,
  ...props
}: Props) {
  const { settings } = useTableSettings<ContainersTableSettings>();

  const containersQuery = useContainers(
    environment.Id,
    true,
    filters,
    isRefreshVisible ? settings.autoRefreshRate * 1000 : undefined
  );

  if (!containersQuery.data) {
    return null;
  }

  return (
    <ContainersDatatable
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      containers={containersQuery.data}
      isRefreshVisible={isRefreshVisible}
      environment={environment}
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
