export type IssueState = "open" | "closed";
export type IssueStatusKey = "todo" | "in_progress" | "done";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  teamIds: string[];
}

export interface TeamSummary {
  id: string;
  name: string;
  key: string;
}

export interface ProjectSummary {
  id: string;
  teamId: string;
  name: string;
  key: string;
  issueCount: number;
}

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface IssueAssignee {
  id: string;
  displayName: string;
}

export interface IssueSummary {
  id: string;
  teamId: string;
  projectId: string;
  identifier: string;
  title: string;
  descriptionHtml: string;
  state: IssueState;
  statusKey: IssueStatusKey;
  order: string;
  updatedAt: string;
  startsAt?: string | null;
  targetDate?: string | null;
  labels: IssueLabel[];
  assignee: IssueAssignee;
}

export interface BoardStatus {
  key: IssueStatusKey;
  name: string;
  order: number;
}

export interface BoardResponse {
  workspaceName: string;
  activeTeam: TeamSummary;
  activeProject: ProjectSummary;
  projects: ProjectSummary[];
  statuses: BoardStatus[];
  issues: IssueSummary[];
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface CreateIssueRequest {
  projectId: string;
  title: string;
  descriptionHtml: string;
}

export interface MoveIssueRequest {
  statusKey: IssueStatusKey;
  beforeIssueId: string;
  afterIssueId: string;
}

export interface BoardChangedMessage {
  projectId: string;
  reason: string;
  occurredAt: string;
}
