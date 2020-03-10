import { getUsersMyself } from "./backlogApiUsers";
import { getVersions } from "./backlogApiVersions";
import { BacklogStatus } from "./backlogApiStatuses";
import { getIssues, getIssuesCount } from "./backlogApiIssues";

// Add a custom menu to the active spreadsheet, including a separator and a sub-menu.
function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu("GAS拡張Menu")
    .addItem("環境設定", "showConfig")
    .addSeparator()
    .addItem("タスク一覧を取得する", "getTasksList")
    .addToUi();
}

const scriptProperties = PropertiesService.getScriptProperties();
const userProperties = PropertiesService.getUserProperties();
const BACKLOG_APIKEY = userProperties.getProperty("BACKLOG_APIKEY");
const BACKLOG_BASE_URL = scriptProperties.getProperty("BACKLOG_BASE_URL");
const BACKLOG_PROJECTID = scriptProperties.getProperty("BACKLOG_PROJECTID");
const BACKLOG_MILESTONEID = scriptProperties.getProperty("BACKLOG_MILESTONEID");

function showConfig() {
  const htmlOutput = HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("設定");
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function saveUserPrefs(apikey: string): void {
  console.log("save apikey: " + BACKLOG_APIKEY + " ->>>>> " + apikey);
  userProperties.setProperty("BACKLOG_APIKEY", apikey);
}

function saveScriptPrefs(
  baseUrl: string,
  projectId: string,
  milestoneId: string
): void {
  console.log("save baseUrl: " + BACKLOG_BASE_URL + " ->>>>> " + baseUrl);
  scriptProperties.setProperty("BACKLOG_BASE_URL", baseUrl);
  console.log("save projectId: " + BACKLOG_PROJECTID + " ->>>>> " + projectId);
  scriptProperties.setProperty("BACKLOG_PROJECTID", projectId);
  console.log(
    "save milestoneId: " + BACKLOG_MILESTONEID + " ->>>>> " + milestoneId
  );
  scriptProperties.setProperty("BACKLOG_MILESTONEID", milestoneId);
}

function connectTest(): void {
  const result = getUsersMyself(BACKLOG_BASE_URL, BACKLOG_APIKEY);
  let message = "";
  if (result) {
    message = result.name + " Backlog接続OK";
  } else {
    message = "Backlog接続Error";
  }
  SpreadsheetApp.getUi().alert(message);
}

function getProgress(status: BacklogStatus): number {
  switch (status.id) {
    case 1:
      return 0;
    case 2:
      return 0.5;
    case 3:
      return 0.9;
    case 4:
      return 1;
    default:
      return 0;
  }
}

enum sheetIndex {
  taskId,
  lv1,
  lv2,
  lv3,
  lv4,
  lv5,
  plannedStart,
  plannedFinish,
  actualStart,
  actualFinish,
  plannedWorkload,
  actualWorkload,
  responsiblity,
  progress
}

let sheetData: any = [];
function appendScheduleSheet(rows: any[]): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("schedule");
  rows.forEach(r => {
    sheet.appendRow(r);
  });
}

function getIssuesList(milestoneId: string): number {
  const amount = getIssuesCount(
    BACKLOG_BASE_URL,
    BACKLOG_APIKEY,
    BACKLOG_PROJECTID,
    milestoneId
  );
  if (amount == 0) {
    return amount;
  }

  let offset = 0;
  let quantity = amount;
  while (quantity > 0) {
    const count = quantity < 100 ? quantity : 100;
    const result = getIssues(
      BACKLOG_BASE_URL,
      BACKLOG_APIKEY,
      BACKLOG_PROJECTID,
      milestoneId,
      "summary",
      offset,
      count
    );
    if (result.length > 0) {
      const rowData = result.map(issue => {
        console.log({ issue });
        const issueData = [];
        let startDate = "";
        if (issue.startDate) {
          startDate = Utilities.formatDate(
            new Date(Date.parse(issue.startDate)),
            "Asia/Tokyo",
            "yyyy/MM/dd"
          );
        }
        let dueDate = "";
        if (issue.dueDate) {
          dueDate = Utilities.formatDate(
            new Date(Date.parse(issue.dueDate)),
            "Asia/Tokyo",
            "yyyy/MM/dd"
          );
        }
        issueData[sheetIndex.lv5] = issue.id;
        issueData[sheetIndex.lv2] = issue.summary;
        issueData[sheetIndex.plannedStart] = startDate;
        issueData[sheetIndex.plannedFinish] = dueDate;
        issueData[sheetIndex.plannedWorkload] = 1;
        issueData[sheetIndex.responsiblity] = issue.assignee.name;
        issueData[sheetIndex.progress] = getProgress(issue.status);
        return issueData;
      });
      sheetData = Array.prototype.concat(sheetData, rowData);
    }

    quantity -= count;
    offset += count;
  }
  console.log(sheetData);

  return amount;
}

function getTasksList(): void {
  const result = getVersions(
    BACKLOG_BASE_URL,
    BACKLOG_APIKEY,
    BACKLOG_PROJECTID
  );
  const milestoneIds = BACKLOG_MILESTONEID.split(",");

  if (result.length > 0) {
    result.forEach(version => {
      if (version.archived) {
        return;
      }
      if (!milestoneIds.includes(version.id.toString())) {
        return;
      }
      console.log({ version });

      const rowData = [];
      let startDate = "";
      if (version.startDate) {
        startDate = Utilities.formatDate(
          new Date(Date.parse(version.startDate)),
          "Asia/Tokyo",
          "yyyy/MM/dd"
        );
      }
      let releaseDueDate = "";
      if (version.releaseDueDate) {
        releaseDueDate = Utilities.formatDate(
          new Date(Date.parse(version.releaseDueDate)),
          "Asia/Tokyo",
          "yyyy/MM/dd"
        );
      }
      rowData[sheetIndex.lv5] = version.id;
      rowData[sheetIndex.lv1] = version.name;
      rowData[sheetIndex.plannedStart] = startDate;
      rowData[sheetIndex.plannedFinish] = releaseDueDate;
      sheetData.push(rowData);
      const issuesCount = getIssuesList(version.id.toString());
      console.log(`versionId: ${version.id}, issuesCount: ${issuesCount}`);
    });
  }
  console.log(sheetData);
  appendScheduleSheet(sheetData);
}
