import { backlogApiGet } from "./backlogApi";
import { BacklogUser } from "./backlogApiUsers";
import { BacklogVersion } from "./backlogApiVersions";
import { BacklogPriority } from "./backlogApiPriorities";
import { BacklogStatus } from "./backlogApiStatuses";
import { BacklogCategory } from "./backlogApiCategories";

export interface BacklogIssuesCount {
  count: number;
}

export interface BacklogIssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogIssue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: BacklogIssueType;
  summary: string;
  description: string;
  resolutions: number;
  priority: BacklogPriority;
  status: BacklogStatus;
  assignee: BacklogUser;
  category: BacklogCategory[];
  versions: BacklogVersion[];
  milestone: BacklogVersion[];
  startDate: string;
  dueDate: string;
  createdUser: BacklogUser;
  created: string;
  updatedUser: BacklogUser;
  updated: string;
}

export function getIssuesCount(
  baseUrl: string,
  apiKey: string,
  projectId: string,
  milestoneId: string
): number {
  let url = `${baseUrl}/api/v2/issues/count?apiKey=${apiKey}\
&projectId[]=${projectId}`;
  const milestoneIds = milestoneId.split(",").map((value, index) => {
    return "milestoneId[" + index + "]=" + value;
  });
  url += "&" + milestoneIds.join("&");
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogIssuesCount;
    return result.count;
  }
  return 0;
}

export function getIssues(
  baseUrl: string,
  apiKey: string,
  projectId: string,
  milestoneId: string,
  sort: string,
  offset: number,
  count: number
): BacklogIssue[] {
  let url = `${baseUrl}/api/v2/issues?apiKey=${apiKey}\
&projectId[]=${projectId}\
&sort=${sort}\
&offset=${offset}\
&count=${count}`;
  const milestoneIds = milestoneId.split(",").map((value, index) => {
    return "milestoneId[" + index + "]=" + value;
  });
  url += "&" + milestoneIds.join("&");
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogIssue[];
    return result;
  }
  return [];
}
