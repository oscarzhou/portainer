import { useMutation, useQuery } from 'react-query';

import { notifyError } from '../services/notifications';

import {
  createTeam,
  getTeam,
  getTeamMemberships,
  getTeams,
} from './teams.service';
import { FormValues, Team, TeamId } from './types';

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

export function useAddTeamMutation() {
  return useMutation(
    (values: FormValues) => createTeam(values.name, values.leaders),
    {
      onError(error) {
        notifyError('Failure', error as Error, 'Failure to add team');
      },
    }
  );
}

export function useTeam(id: TeamId, onError?: (error: unknown) => void) {
  return useQuery(['teams', id], () => getTeam(id), {
    onError(error) {
      notifyError('Failure', error as Error, 'Failed retrieving team');
      if (onError) {
        onError(error);
      }
    },
  });
}

export function useTeamMemberships(id: TeamId) {
  return useQuery(['teams', id, 'memberships'], () => getTeamMemberships(id), {
    onError(error) {
      notifyError(
        'Failure',
        error as Error,
        'Failed retrieving team memberships'
      );
    },
  });
}
