import { backlogApiGet } from "./backlogApi";

export interface BacklogCategory {
  id: number;
  name: string;
  displayOrder: number;
}

export function getPriorities(
  baseUrl: string,
  apiKey: string,
  projectIdOrKey: string
): BacklogCategory[] {
  const url = `${baseUrl}/api/v2/projects/${projectIdOrKey}/categories?apiKey=${apiKey}`;
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogCategory[];
    return result;
  }
  return [];
}
