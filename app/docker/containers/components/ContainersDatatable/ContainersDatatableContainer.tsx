import { react2angular } from '@/react-tools/react2angular';
import { TableSettingsProvider } from '@/portainer/components/datatables/components/useTableSettings';

import {
  ContainersDatatable,
  Props as ContainerDatatableProps,
} from './ContainersDatatable';

export function ContainersDatatableContainer({
  environment,
  tableKey = 'containers',
  ...props
}: ContainerDatatableProps) {
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
      <ContainersDatatable {...props} environment={environment} />
    </TableSettingsProvider>
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
