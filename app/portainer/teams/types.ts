import { UserId } from '../users/types';

export type TeamId = number;

export enum TeamRole {
  Leader = 1,
  Member,
}

export type Team = {
  Id: TeamId;
  Name: string;
};

export interface FormValues {
  name: string;
  leaders: UserId[];
}

export type TeamMembershipId = number;

export interface TeamMembership {
  Id: number;
  UserID: UserId;
  TeamID: TeamId;
  Role: TeamRole;
}
