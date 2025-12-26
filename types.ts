export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  motto?: string;
  members: Participant[];
}

export enum AppMode {
  INPUT = 'INPUT',
  LUCKY_DRAW = 'LUCKY_DRAW',
  TEAM_GENERATOR = 'TEAM_GENERATOR'
}

export interface AiTeamNameResponse {
  groups: {
    index: number;
    teamName: string;
    motto: string;
  }[];
}