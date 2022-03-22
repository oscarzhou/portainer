import { createRowContext } from '@/portainer/components/datatables/components/RowContext';
import { TeamRole } from '@/portainer/teams/types';
import { UserId } from '@/portainer/users/types';

export interface RowContext {
  getRole(userId: UserId): TeamRole;
  onRemoveClick(userId: UserId): void;
  onUpdateRoleClick(userId: UserId, role: TeamRole): void;
}

const { RowProvider, useRowContext } = createRowContext<RowContext>();

export { RowProvider, useRowContext };
