import { BacklogUser } from "./backlogApiUsers";
import { BacklogVersion } from "./backlogApiVersions";
import { BacklogCategory } from "./backlogApiCategories";
import { BacklogPriority } from "./backlogApiPriorities";
import { BacklogIssue, BacklogIssuesCount } from "./backlogApiIssues";

export interface BacklogResponseCode {
  responseCode: number;
}

export type BacklogResponseContent =
  | string
  | BacklogCategory[]
  | BacklogIssue[]
  | BacklogIssuesCount
  | BacklogPriority[]
  | BacklogUser
  | BacklogVersion[];

export type BacklogResponse = BacklogResponseCode & {
  content: BacklogResponseContent;
};

export function backlogApiGet(url: string): BacklogResponse {
  const options = {
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    console.info(url + ":responscode>>>" + responseCode);
    const contentText = response.getContentText();
    if (responseCode == 200) {
      const content: BacklogResponseContent = JSON.parse(contentText);
      return {
        responseCode: responseCode,
        content: content
      };
    }
    console.info(":contentText>>>" + contentText);
    return {
      responseCode: responseCode,
      content: contentText
    };
  } catch (e) {
    console.log(
      "message:" +
        e.message +
        "\nfileName:" +
        e.fileName +
        "\nlineNumber:" +
        e.lineNumber +
        "\nstack:" +
        e.stack
    );
    throw e;
  }
}
