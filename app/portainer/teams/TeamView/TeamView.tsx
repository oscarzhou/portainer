import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import _ from 'lodash';
import { useMutation, useQueryClient } from 'react-query';

import { error as notifyError } from '@/portainer/services/notifications';
import { PageHeader } from '@/portainer/components/PageHeader';
import { useUsers } from '@/portainer/users/queries';
import { r2a } from '@/react-tools/react2angular';
import { useUser } from '@/portainer/hooks/useUser';
import { UserId } from '@/portainer/users/types';
import { promiseSequence } from '@/portainer/helpers/promise-utils';

import { useTeam, useTeamMemberships } from '../queries';
import { TeamId, TeamMembership, TeamRole } from '../types';
import {
  createTeamMembership,
  deleteTeamMembership,
  updateTeamMembership,
} from '../team-membership.service';

import { Details } from './Details';
import { TeamAssociationSelector } from './TeamAssociationSelector';

export function TeamView() {
  const {
    params: { id: teamIdParam },
  } = useCurrentStateAndParams();
  const teamId = parseInt(teamIdParam, 10);

  if (!teamIdParam || Number.isNaN(teamId)) {
    throw new Error('Team ID is missing');
  }

  const { isAdmin } = useUser();
  const router = useRouter();
  const teamQuery = useTeam(teamId, () =>
    router.stateService.go('portainer.teams')
  );
  const usersQuery = useUsers();
  const membershipsQuery = useTeamMemberships(teamId);

  const addMemberMutation = useAddMemberMutation(teamId);
  const removeMemberMutation = useRemoveMemberMutation(
    teamId,
    membershipsQuery.data
  );
  const updateRoleMutation = useUpdateRoleMutation(
    teamId,
    membershipsQuery.data
  );

  return (
    <>
      <PageHeader
        title="Team details"
        breadcrumbs={_.compact([
          { label: 'Teams' },
          teamQuery.data && { label: teamQuery.data.Name },
        ])}
      />
      {teamQuery.data && membershipsQuery.data && (
        <Details
          team={teamQuery.data}
          memberships={membershipsQuery.data}
          isAdmin={isAdmin}
        />
      )}

      {teamQuery.data && usersQuery.data && membershipsQuery.data && (
        <TeamAssociationSelector
          memberships={membershipsQuery.data}
          users={usersQuery.data}
          onAddUsers={handleAddMembers}
          onRemoveUsers={handleRemoveMembers}
          onUpdateRoleClick={handleUpdateRole}
        />
      )}
    </>
  );

  function handleAddMembers(userIds: UserId[]) {
    addMemberMutation.mutate(userIds);
  }

  function handleRemoveMembers(userIds: UserId[]) {
    removeMemberMutation.mutate(userIds);
  }

  function handleUpdateRole(userId: UserId, role: TeamRole) {
    updateRoleMutation.mutate({ userId, role });
  }
}

function useAddMemberMutation(teamId: TeamId) {
  const queryClient = useQueryClient();

  return useMutation(
    (userIds: UserId[]) =>
      promiseSequence(
        userIds.map(
          (userId) => () =>
            createTeamMembership(userId, teamId, TeamRole.Member)
        )
      ),
    {
      onError(error) {
        notifyError('Failure', error as Error, 'Failure to add membership');
      },
      onSuccess() {
        queryClient.invalidateQueries(['teams', teamId, 'memberships']);
      },
    }
  );
}

function useRemoveMemberMutation(
  teamId: TeamId,
  teamMemberships: TeamMembership[] = []
) {
  const queryClient = useQueryClient();

  return useMutation(
    (userIds: UserId[]) =>
      promiseSequence(
        userIds.map((userId) => () => {
          const membership = teamMemberships.find(
            (membership) => membership.UserID === userId
          );
          if (!membership) {
            throw new Error('Membership not found');
          }
          return deleteTeamMembership(membership.Id);
        })
      ),
    {
      onError(error) {
        notifyError('Failure', error as Error, 'Failure to add membership');
      },
      onSuccess() {
        queryClient.invalidateQueries(['teams', teamId, 'memberships']);
      },
    }
  );
}

function useUpdateRoleMutation(
  teamId: TeamId,
  teamMemberships: TeamMembership[] = []
) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ userId, role }: { userId: UserId; role: TeamRole }) => {
      const membership = teamMemberships.find(
        (membership) => membership.UserID === userId
      );
      if (!membership) {
        throw new Error('Membership not found');
      }
      return updateTeamMembership(membership.Id, userId, teamId, role);
    },
    {
      onError(error) {
        notifyError('Failure', error as Error, 'Failure to update membership');
      },
      onSuccess() {
        queryClient.invalidateQueries(['teams', teamId, 'memberships']);
      },
    }
  );
}

export const TeamViewAngular = r2a(TeamView, []);
