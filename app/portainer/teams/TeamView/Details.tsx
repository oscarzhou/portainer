import { useRouter } from '@uirouter/react';
import { useMutation, useQueryClient } from 'react-query';

import { Button } from '@/portainer/components/Button';
import { Widget, WidgetBody, WidgetTitle } from '@/portainer/components/widget';
import { confirmDeletionAsync } from '@/portainer/services/modal.service/confirm';

import { Team, TeamId, TeamMembership, TeamRole } from '../types';
import { deleteTeam } from '../teams.service';

interface Props {
  team: Team;
  memberships: TeamMembership[];
  isAdmin: boolean;
}

export function Details({ team, memberships, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteTeam();
  const router = useRouter();

  const leaderCount = memberships.filter(
    (m) => m.Role === TeamRole.Leader
  ).length;

  return (
    <div className="row">
      <div className="col-lg-12 col-md-12 col-xs-12">
        <Widget>
          <WidgetTitle title="Team details" icon="fa-users" />

          <WidgetBody className="no-padding">
            <table className="table">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>
                    {team.Name}
                    {isAdmin && (
                      <Button
                        color="danger"
                        size="xsmall"
                        onClick={handleDeleteClick}
                      >
                        <i
                          className="fa fa-trash-alt space-right"
                          aria-hidden="true"
                        />
                        Delete this team
                      </Button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Leaders</td>
                  <td>{leaderCount}</td>
                </tr>
                <tr>
                  <td>Total users in team</td>
                  <td>{memberships.length}</td>
                </tr>
              </tbody>
            </table>
          </WidgetBody>
        </Widget>
      </div>
    </div>
  );

  async function handleDeleteClick() {
    const confirmed = await confirmDeletionAsync(
      `Do you want to delete this team? Users in this team will not be deleted.`
    );
    if (!confirmed) {
      return;
    }

    router.stateService.go('portainer.teams');
    deleteMutation.mutate(team.Id, {
      onSuccess() {
        queryClient.invalidateQueries(['teams']);
      },
    });
  }
}

function useDeleteTeam() {
  return useMutation((id: TeamId) => deleteTeam(id), {
    meta: {
      error: {
        title: 'Failure',
        message: 'Unable to delete team',
      },
    },
  });
}
