import { UserId } from '@/portainer/users/types';

import axios, { parseAxiosError } from '../services/axios';

import { TeamId, TeamRole, TeamMembershipId } from './types';

export async function createTeamMembership(
  userId: UserId,
  teamId: TeamId,
  role: TeamRole
) {
  try {
    await axios.post(buildUrl(), { userId, teamId, role });
  } catch (e) {
    throw parseAxiosError(e as Error, 'Unable to create team membership');
  }
}

function buildUrl(id?: TeamMembershipId) {
  let url = '/team_memberships';

  if (id) {
    url += `/${id}`;
  }

  return url;
}
