import { backlogApiGet } from "./backlogApi";

export interface BacklogPriority {
  id: number;
  name: string;
}

export function getPriorities(
  baseUrl: string,
  apiKey: string
): BacklogPriority[] {
  const url = `${baseUrl}/api/v2/priorities?apiKey=${apiKey}`;
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogPriority[];
    return result;
  }
  return [];
}
