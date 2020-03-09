import { getUsersMyself } from "./backlogApiUsers";
import { getVersions } from "./backlogApiVersions";
import { BacklogStatus } from "./backlogApiStatuses";
import { getIssues, getIssuesCount } from "./backlogApiIssues";

// Add a custom menu to the active spreadsheet, including a separator and a sub-menu.
function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu("GAS拡張Menu")
    .addItem("Backlog接続確認", "connectTest")
    .addSeparator()
    .addItem("タスク一覧を取得する", "getTasksList")
    .addToUi();
}

const scriptProperties = PropertiesService.getScriptProperties();
const BACKLOG_BASE_URL = scriptProperties.getProperty("BACKLOG_BASE_URL");
const BACKLOG_APIKEY = scriptProperties.getProperty("BACKLOG_APIKEY");
const BACKLOG_PROJECTIDORKEY = scriptProperties.getProperty(
  "BACKLOG_PROJECTID"
);
const BACKLOG_MILESTONE_ID = scriptProperties.getProperty(
  "BACKLOG_MILESTONE_ID"
);

function connectTest(): void {
  const result = getUsersMyself(BACKLOG_BASE_URL, BACKLOG_APIKEY);
  let message = "";
  if (result) {
    message = "name: " + result.name + " 接続OK";
  } else {
    message = "接続Error";
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

const sheetData: any = [];
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
    BACKLOG_PROJECTIDORKEY,
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
      BACKLOG_PROJECTIDORKEY,
      milestoneId,
      "summary",
      offset,
      count
    );
    if (result.length > 0) {
      result.forEach(issue => {
        console.log({ issue });
        const rowData = [];
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
        rowData[sheetIndex.lv5] = issue.id;
        rowData[sheetIndex.lv2] = issue.summary;
        rowData[sheetIndex.plannedStart] = startDate;
        rowData[sheetIndex.plannedFinish] = dueDate;
        rowData[sheetIndex.plannedWorkload] = 1;
        rowData[sheetIndex.responsiblity] = issue.assignee.name;
        rowData[sheetIndex.progress] = getProgress(issue.status);
        sheetData.push(rowData);
      });
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
    BACKLOG_PROJECTIDORKEY
  );
  if (result.length > 0) {
    result.forEach(version => {
      if (version.archived) {
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
