import { CellProps, Column } from 'react-table';

import { User } from '@/portainer/users/types';
import { Button } from '@/portainer/components/Button';
import { useUser as useCurrentUser } from '@/portainer/hooks/useUser';
import { TeamRole } from '@/portainer/teams/types';

import { useRowContext } from './RowContext';

export const teamRole: Column<User> = {
  Header: 'Team Role',
  accessor: 'Id',
  id: 'role',
  Cell: RoleCell,
  disableFilters: true,
  Filter: () => null,
  canHide: false,
  sortType: 'string',
};

export function RoleCell({ row: { original: user } }: CellProps<User>) {
  const { onUpdateRoleClick, getRole } = useRowContext();
  const role = getRole(user.Id);

  const { isAdmin } = useCurrentUser();

  return (
    <>
      {role === TeamRole.Leader ? (
        <LeaderCell
          isAdmin={isAdmin}
          onClick={() => onUpdateRoleClick(user.Id, TeamRole.Member)}
        />
      ) : (
        <MemberCell
          isAdmin={isAdmin}
          onClick={() => onUpdateRoleClick(user.Id, TeamRole.Leader)}
        />
      )}
    </>
  );
}

interface SubCellProps {
  isAdmin: boolean;
  onClick: () => void;
}

function LeaderCell({ isAdmin, onClick }: SubCellProps) {
  return (
    <>
      <i className="fa fa-user-plus space-right" aria-hidden="true" /> Leader
      {isAdmin && (
        <Button color="link" className="nopadding" onClick={onClick}>
          <i className="fa fa-user-times space-right" aria-hidden="true" />
          Member
        </Button>
      )}
    </>
  );
}

function MemberCell({ isAdmin, onClick }: SubCellProps) {
  return (
    <>
      <i className="fa fa-user space-right" aria-hidden="true" /> Member
      {isAdmin && (
        <Button color="link" className="nopadding" onClick={onClick}>
          <i className="fa fa-user-plus space-right" aria-hidden="true" />
          Leader
        </Button>
      )}
    </>
  );
}
