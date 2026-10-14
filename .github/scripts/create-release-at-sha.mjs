import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import semanticRelease from "semantic-release";

const SHA_RE = /^[0-9a-f]{40}$/;

function run(cmd, options = {}) {
  const { stdio, cwd, ...rest } = options;
  const out = execSync(cmd, {
    encoding: stdio === "inherit" ? undefined : "utf8",
    stdio: stdio ?? "pipe",
    cwd,
    ...rest,
  });
  return typeof out === "string" ? out.trim() : "";
}

function tagsPointingAt(sha) {
  try {
    return run(`git tag --points-at ${sha}`)
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function lastVersionTagBefore(sha, cwd) {
  try {
    return run(`git describe --tags --abbrev=0 --match "v*" ${sha}^`, { cwd });
  } catch {
    return "";
  }
}

const releaseSha = process.env.RELEASE_SHA?.trim();
if (!releaseSha || !SHA_RE.test(releaseSha)) {
  throw new Error("RELEASE_SHA must be a 40-character lowercase git commit sha");
}

if (process.env.GITHUB_ACTIONS === "true") {
  run("git fetch origin main --tags", { stdio: "inherit" });
}

const existingTags = tagsPointingAt(releaseSha);
if (existingTags.length > 0) {
  console.log(
    `Release already tagged at ${releaseSha}: ${existingTags.join(", ")}. Nothing to do.`,
  );
  process.exit(0);
}

const mirrorDir = mkdtempSync(join(tmpdir(), "sr-"));
const barePath = join(mirrorDir, "sr.git");
const workDir = join(mirrorDir, "worktree");

try {
  run(`git clone --bare --no-local . "${barePath}"`, { stdio: "inherit" });
  run(`git -C "${barePath}" update-ref refs/heads/main ${releaseSha}`, {
    stdio: "inherit",
  });
  run(`git clone "${barePath}" "${workDir}"`, { stdio: "inherit" });
  run(`git -C "${workDir}" checkout --detach ${releaseSha}`, {
    stdio: "inherit",
  });

  const head = run(`git -C "${workDir}" rev-parse HEAD`);
  if (head !== releaseSha) {
    throw new Error(
      `Working copy HEAD must equal RELEASE_SHA (expected ${releaseSha}, got ${head})`,
    );
  }

  const repositoryUrl = `file://${barePath}`;

  const result = await semanticRelease(
    {
      branches: ["main"],
      repositoryUrl,
      plugins: ["@semantic-release/commit-analyzer"],
      dryRun: true,
    },
    {
      cwd: workDir,
      env: {
        ...process.env,
        GITHUB_REF: "refs/heads/main",
        GITHUB_SHA: releaseSha,
      },
    },
  );

  if (!result?.nextRelease?.version) {
    console.log("No release-worthy commits since last tag");
    process.exit(0);
  }

  const version = result.nextRelease.version;
  const tag = `v${version}`;
  const lastTag = lastVersionTagBefore(releaseSha, workDir);

  const ghArgs = [
    "release",
    "create",
    tag,
    "--target",
    releaseSha,
    "--title",
    tag,
    "--generate-notes",
  ];
  if (lastTag) {
    ghArgs.push("--notes-start-tag", lastTag);
  }

  console.log(`Creating GitHub release: gh ${ghArgs.join(" ")}`);

  if (process.env.GH_RELEASE_STUB === "1") {
    console.log(`[GH_RELEASE_STUB] gh ${ghArgs.join(" ")}`);
    console.log(`Computed version: ${tag}`);
    if (lastTag) {
      console.log(`notes-start-tag: ${lastTag}`);
    }
  } else {
    execFileSync("gh", ghArgs, {
      stdio: "inherit",
      env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
    });
  }
} finally {
  rmSync(mirrorDir, { recursive: true, force: true });
}
