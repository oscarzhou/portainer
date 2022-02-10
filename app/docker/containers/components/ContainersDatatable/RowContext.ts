import { createRowContext } from '@/portainer/components/datatables/RowContext';
import { Environment } from '@/portainer/environments/types';

interface RowContextState {
  environment: Environment;
}

const { RowProvider, useRowContext } = createRowContext<RowContextState>();

export { RowProvider, useRowContext };
