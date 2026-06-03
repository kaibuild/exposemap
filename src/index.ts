import { parseComposeFile } from "./parser.js";
import { analyzeProject } from "./rules/serviceClassifier.js";
import { renderJsonReport } from "./report/json.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { renderTableReport } from "./report/table.js";
import type { ExposureReport } from "./types.js";

export async function scanComposeFile(filePath: string): Promise<ExposureReport> {
  const project = await parseComposeFile(filePath);
  return analyzeProject(project);
}

export async function scanComposeFileToMarkdown(filePath: string): Promise<string> {
  const report = await scanComposeFile(filePath);
  return renderMarkdownReport(report);
}

export async function scanComposeFileToJson(filePath: string): Promise<string> {
  const report = await scanComposeFile(filePath);
  return renderJsonReport(report);
}

export async function scanComposeFileToTable(filePath: string): Promise<string> {
  const report = await scanComposeFile(filePath);
  return renderTableReport(report);
}

export * from "./types.js";
export { parseComposeContent, parseComposeFile } from "./parser.js";
export { analyzeProject, analyzeService } from "./rules/serviceClassifier.js";
export { parseFailOnThreshold, getExitCodeForReport, violatesFailOnThreshold } from "./failOn.js";
export { buildJsonReport, renderJsonReport } from "./report/json.js";
export { renderMarkdownReport } from "./report/markdown.js";
export { renderTableReport } from "./report/table.js";
export { renderMermaidDiagram } from "./report/mermaid.js";
