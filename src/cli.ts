#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import { getExitCodeForReport, parseFailOnThreshold } from "./failOn.js";
import { scanComposeFile } from "./index.js";
import { renderJsonReport } from "./report/json.js";
import { renderHtmlReport } from "./report/html.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { renderTableReport } from "./report/table.js";
import { getToolVersion } from "./version.js";

const program = new Command();
const supportedFormats = new Set(["table", "markdown", "json", "html"]);

program
  .name("exposemap")
  .description("Open-source exposure mapper for self-hosted Docker Compose services")
  .version(getToolVersion())
  .exitOverride();

program
  .command("scan")
  .argument("<compose-file>", "Path to docker-compose.yml")
  .option("--format <format>", "Report format: table, markdown, json, or html", "table")
  .option("--fail-on <severity>", "Exit 1 on findings at or above severity: high, medium, low, none", "none")
  .description("Scan a Docker Compose file and print an exposure report")
  .action(async (composeFile: string, options: { format: string; failOn: string }) => {
    const format = options.format.toLowerCase();
    const failOn = parseFailOnThreshold(options.failOn.toLowerCase());

    if (!supportedFormats.has(format)) {
      console.error(`Unsupported format: ${options.format}. Supported formats: table, markdown, json, html.`);
      process.exitCode = 2;
      return;
    }

    if (!failOn) {
      console.error(`Unsupported --fail-on value: ${options.failOn}. Supported values: high, medium, low, none.`);
      process.exitCode = 2;
      return;
    }

    try {
      const report = await scanComposeFile(composeFile);
      const output =
        format === "json"
          ? renderJsonReport(report)
          : format === "html"
            ? renderHtmlReport(report)
            : format === "markdown"
              ? renderMarkdownReport(report)
              : renderTableReport(report);
      process.stdout.write(output);
      process.exitCode = getExitCodeForReport(report, failOn);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`ExposeMap failed: ${message}`);
      process.exitCode = 1;
    }
  });

try {
  await program.parseAsync();
} catch (error) {
  if (error instanceof CommanderError) {
    process.exitCode = error.exitCode === 0 ? 0 : 2;
  } else {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`ExposeMap failed: ${message}`);
    process.exitCode = 2;
  }
}
