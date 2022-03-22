import _ from 'lodash';

import { User, UserId } from '@/portainer/users/types';

import { TeamMembership, TeamRole } from '../../types';

import { UsersList } from './UsersList';
import { TeamMembersList } from './TeamMembersList';

interface Props {
  onAddUsers(usersIds: UserId[]): void;
  onRemoveUsers(usersIds: UserId[]): void;
  users: User[];
  memberships: TeamMembership[];
  onUpdateRoleClick(userId: UserId, role: TeamRole): void;
}

export function TeamAssociationSelector({
  onAddUsers,
  onRemoveUsers,
  users,
  memberships,
  onUpdateRoleClick,
}: Props) {
  const teamUsers = _.compact(
    memberships.map((m) => users.find((user) => user.Id === m.UserID))
  );
  const usersNotInTeam = users.filter(
    (user) => !memberships.some((m) => m.UserID === user.Id)
  );
  const userRoles = Object.fromEntries(
    memberships.map((m) => [m.UserID, m.Role])
  );

  return (
    <div className="row">
      <div className="col-sm-6">
        <UsersList users={usersNotInTeam} onAddUsers={onAddUsers} />
      </div>
      <div className="col-sm-6">
        <TeamMembersList
          users={teamUsers}
          onRemoveUsers={onRemoveUsers}
          roles={userRoles}
          onUpdateRoleClick={onUpdateRoleClick}
        />
      </div>
    </div>
  );
}
