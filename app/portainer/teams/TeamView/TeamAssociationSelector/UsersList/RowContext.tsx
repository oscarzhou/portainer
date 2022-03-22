import { createRowContext } from '@/portainer/components/datatables/components/RowContext';
import { UserId } from '@/portainer/users/types';

interface RowContext {
  onClick: (userId: UserId) => void;
}

const { RowProvider, useRowContext } = createRowContext<RowContext>();

export { RowProvider, useRowContext };
