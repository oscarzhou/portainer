import { useQuery } from 'react-query';

import { getTeam, getTeamMemberships, getTeams } from './teams.service';
import { Team, TeamId } from './types';

export function useTeams<T = Team[]>(
  enabled = true,
  select: (data: Team[]) => T = (data) => data as unknown as T
) {
  const teams = useQuery(['teams'], () => getTeams(), {
    meta: {
      error: { title: 'Failure', message: 'Unable to load teams' },
    },
    enabled,
    select,
  });

  return teams;
}

export function useTeam(id: TeamId, onError?: (error: unknown) => void) {
  return useQuery(['teams', id], () => getTeam(id), {
    meta: {
      error: { title: 'Failure', message: 'Unable to load team' },
    },
    onError,
  });
}

export function useTeamMemberships(id: TeamId) {
  return useQuery(['teams', id, 'memberships'], () => getTeamMemberships(id), {
    meta: {
      error: { title: 'Failure', message: 'Unable to load team memberships' },
    },
  });
}
