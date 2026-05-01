#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function parseArgs(argv) {
  const options = {
    url: "",
    postUrl: "",
    outputDir: "./artifacts",
    browser: "auto",
    tag: "run",
    noPrompt: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "-y" || arg === "--yes" || arg === "--no-prompt") {
      options.noPrompt = true;
      continue;
    }

    const value = argv[i + 1];

    if (arg === "--url") {
      if (!value) {
        throw new Error("Missing value for --url");
      }
      options.url = value;
      i += 1;
      continue;
    }

    if (arg === "--post-url") {
      if (!value) {
        throw new Error("Missing value for --post-url");
      }
      options.postUrl = value;
      i += 1;
      continue;
    }

    if (arg === "--output-dir") {
      if (!value) {
        throw new Error("Missing value for --output-dir");
      }
      options.outputDir = value;
      i += 1;
      continue;
    }

    if (arg === "--browser") {
      if (!value) {
        throw new Error("Missing value for --browser");
      }
      options.browser = value;
      i += 1;
      continue;
    }

    if (arg === "--tag") {
      if (!value) {
        throw new Error("Missing value for --tag");
      }
      options.tag = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function usage() {
  console.log(`Usage:
  node ./scripts/run-axe-cli.mjs --url <target-url> [options]

Options:
  --url <url>                Target URL to scan (required)
  --post-url <url>           Optional post-interaction URL (defaults to --url)
  --output-dir <path>        Output folder for JSON artifacts (default: ./artifacts)
  --browser <name>           auto | chrome | firefox | edge (default: auto)
  --tag <name>               Artifact tag name (default: run)
  --no-prompt, --yes, -y     Skip Enter prompt between scans
  --help, -h                 Show this help
`);
}

function getBrowserAttempts(requested) {
  if (requested && requested !== "auto") {
    return [requested];
  }

  if (process.platform === "darwin") {
    return ["chrome", "firefox", "edge"];
  }

  if (process.platform === "win32") {
    return ["edge", "chrome", "firefox"];
  }

  return ["chrome", "firefox", "edge"];
}

function runAxeCli(targetUrl, savePath, requestedBrowser) {
  const browserAttempts = getBrowserAttempts(requestedBrowser);
  const explicitBrowser = requestedBrowser && requestedBrowser !== "auto";

  for (const browserName of browserAttempts) {
    const args = ["@axe-core/cli", targetUrl, "--save", savePath, "--browser", browserName];
    console.log(`Running: npx ${args.join(" ")}`);

    const result = spawnSync("npx", args, {
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    if (result.error) {
      throw new Error(`Failed to execute npx. Ensure Node.js/npm are installed and npx is available. (${result.error.message})`);
    }

    if (result.status === 0) {
      return;
    }

    if (explicitBrowser) {
      throw new Error(
        `axe-core/cli failed using browser '${browserName}'. Ensure that browser is installed and available on PATH, or run with --browser auto.`
      );
    }

    console.warn(`axe-core/cli failed with browser '${browserName}'. Trying next browser option...`);
  }

  throw new Error(`axe-core/cli failed for all browser attempts: ${browserAttempts.join(", ")}. Install one of these browsers or run with a specific --browser value.`);
}

async function waitForEnter(noPrompt) {
  if (noPrompt || !process.stdin.isTTY) {
    console.log("Skipping interactive pause before post-interaction scan.");
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise((resolve) => {
    rl.question("Perform the required interaction in the browser, then press Enter to run post-interaction scan: ", () => {
      rl.close();
      resolve();
    });
  });
}

function validateOptions(options) {
  if (!options.url) {
    throw new Error("Missing required --url argument.");
  }

  const allowedBrowsers = new Set(["auto", "chrome", "firefox", "edge"]);
  if (!allowedBrowsers.has(options.browser)) {
    throw new Error("Invalid --browser value. Allowed: auto, chrome, firefox, edge.");
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message || error);
    usage();
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    usage();
    return;
  }

  try {
    validateOptions(options);
  } catch (error) {
    console.error(error.message || error);
    usage();
    process.exitCode = 1;
    return;
  }

  const outputDir = path.resolve(options.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  const safeTag = (options.tag || "run").replace(/[^a-zA-Z0-9_-]/g, "-");
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const postUrl = options.postUrl || options.url;

  const baselineFile = path.join(outputDir, `baseline-${safeTag}-${timestamp}.json`);
  const postFile = path.join(outputDir, `post-${safeTag}-${timestamp}.json`);

  console.log(`Starting axe scans with browser mode '${options.browser}'.`);
  console.log(`Artifacts directory: ${outputDir}`);

  runAxeCli(options.url, baselineFile, options.browser);
  console.log(`Baseline results saved to: ${baselineFile}`);

  await waitForEnter(options.noPrompt);

  runAxeCli(postUrl, postFile, options.browser);
  console.log(`Post-interaction results saved to: ${postFile}`);

  console.log("Done. Use these files as evidence in the ranked findings table.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
