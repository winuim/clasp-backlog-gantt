import { backlogApiGet } from "./backlogApi";

export interface BacklogVersion {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  releaseDueDate: string | null;
  archived: boolean;
  displayOrder: number;
}

export function getVersions(
  baseUrl: string,
  apiKey: string,
  projectIdOrKey: string
): BacklogVersion[] {
  const url = `${baseUrl}/api/v2/projects/${projectIdOrKey}/versions?apiKey=${apiKey}`;
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogVersion[];
    return result;
  }
  return [];
}
