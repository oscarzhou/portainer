import { CellProps, Column } from 'react-table';

import { useTableSettings } from '@/portainer/components/datatables/components/useTableSettings';
import { useAuthorizations } from '@/portainer/hooks/useUser';
import { ContainerQuickActions } from '@/docker/components/container-quick-actions/ContainerQuickActions';
import type {
  ContainersTableSettings,
  DockerContainer,
} from '@/docker/containers/types';
import { EnvironmentStatus } from '@/portainer/environments/types';

import { useRowContext } from '../RowContext';

export const quickActions: Column<DockerContainer> = {
  Header: 'Quick Actions',
  id: 'actions',
  Cell: QuickActionsCell,
  disableFilters: true,
  disableSortBy: true,
  canHide: true,
  sortType: 'string',
  Filter: () => null,
};

function QuickActionsCell({
  row: { original: container },
}: CellProps<DockerContainer>) {
  const { environment } = useRowContext();
  const offlineMode = environment.Status !== EnvironmentStatus.Up;

  const { settings } = useTableSettings<ContainersTableSettings>();

  const { hiddenQuickActions = [] } = settings;

  const wrapperState = {
    showQuickActionAttach: !hiddenQuickActions.includes('attach'),
    showQuickActionExec: !hiddenQuickActions.includes('exec'),
    showQuickActionInspect: !hiddenQuickActions.includes('inspect'),
    showQuickActionLogs: !hiddenQuickActions.includes('logs'),
    showQuickActionStats: !hiddenQuickActions.includes('stats'),
  };

  const someOn =
    wrapperState.showQuickActionAttach ||
    wrapperState.showQuickActionExec ||
    wrapperState.showQuickActionInspect ||
    wrapperState.showQuickActionLogs ||
    wrapperState.showQuickActionStats;

  const isAuthorized = useAuthorizations([
    'DockerContainerStats',
    'DockerContainerLogs',
    'DockerExecStart',
    'DockerContainerInspect',
    'DockerTaskInspect',
    'DockerTaskLogs',
  ]);

  if (offlineMode || !someOn || !isAuthorized) {
    return null;
  }

  return (
    <ContainerQuickActions
      containerId={container.Id}
      nodeName={container.NodeName}
      status={container.State}
      state={wrapperState}
    />
  );
}
