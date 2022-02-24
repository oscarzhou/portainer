import { r2a } from '@/react-tools/react2angular';
import { PageHeader } from '@/portainer/components/PageHeader';
import { useUsers } from '@/portainer/users/queries';
import { useUser } from '@/portainer/hooks/useUser';

import { useTeams } from '../queries';

import { CreateTeamForm } from './CreateTeamForm';
import { TeamsDatatableContainer } from './TeamsDatatable/TeamsDatatable';

export function TeamsView() {
  const { isAdmin } = useUser();

  const usersQuery = useUsers();
  const teamsQuery = useTeams(!isAdmin);

  return (
    <>
      <PageHeader title="Teams" breadcrumbs={[{ label: 'Teams management' }]} />

      {usersQuery.data && teamsQuery.data && (
        <CreateTeamForm users={usersQuery.data} teams={teamsQuery.data} />
      )}

      {teamsQuery.data && <TeamsDatatableContainer teams={teamsQuery.data} />}
    </>
  );
}

export const TeamsViewAngular = r2a(TeamsView, []);
