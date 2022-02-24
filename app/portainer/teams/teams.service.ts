import axios, { parseAxiosError } from '@/portainer/services/axios';

import { UserId } from '../users/types';

import { createTeamMembership } from './team-membership.service';
import { Team, TeamId, TeamRole } from './types';

export async function getTeams(onlyLedTeams = false) {
  try {
    const { data } = await axios.get<Team[]>(buildUrl(), {
      params: { onlyLedTeams },
    });
    return data;
  } catch (error) {
    throw parseAxiosError(error as Error);
  }
}

export async function deleteTeam(id: TeamId) {
  try {
    await axios.delete(buildUrl(id));
  } catch (error) {
    throw parseAxiosError(error as Error);
  }
}

export async function createTeam(name: string, leaders: UserId[]) {
  try {
    const { data: team } = await axios.post(buildUrl(), { name });
    await Promise.all(
      leaders.map((leaderId) =>
        createTeamMembership(leaderId, team.Id, TeamRole.Leader)
      )
    );
  } catch (e) {
    throw parseAxiosError(e as Error, 'Unable to create team');
  }
}

function buildUrl(id?: TeamId) {
  let url = '/teams';

  if (id) {
    url += `/${id}`;
  }

  return url;
}
