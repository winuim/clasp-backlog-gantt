import { backlogApiGet } from "./backlogApi";

export interface BacklogUser {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang: string;
  mailAddress: string;
}

export function getUsers(
  baseUrl: string,
  apiKey: string,
  userId: string
): BacklogUser {
  const url = `${baseUrl}/api/v2/users/${userId}?apiKey=${apiKey}`;
  const res = backlogApiGet(url);
  if (res.responseCode == 200) {
    const result = res.content as BacklogUser;
    return result;
  }
  return null;
}

export function getUsersMyself(baseUrl: string, apiKey: string): BacklogUser {
  return getUsers(baseUrl, apiKey, "myself");
}
