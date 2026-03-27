/**
 * Sets Convex environment variables during Vercel builds.
 * Reads JWT_PRIVATE_KEY, JWKS, and SITE_URL from process.env
 * and pushes them to the Convex deployment via `npx convex env set`.
 *
 * Uses --from-file for values that contain problematic characters (like PEM keys).
 */

import { spawnSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const isPreview = process.env.VERCEL_TARGET_ENV === "preview";
const isProduction = process.env.VERCEL_TARGET_ENV === "production";
const previewName = process.env.VERCEL_GIT_COMMIT_REF;

/**
 * Set a single Convex env var using --from-file to avoid shell/CLI parsing issues.
 * Writes NAME=value to a temp .env file, then calls `npx convex env set --from-file`.
 */
function setConvexEnv(name, value) {
  if (!value) return;

  // Write a .env-style file: NAME=value
  const tmpFile = join(tmpdir(), `convex-env-${name}-${Date.now()}.env`);
  writeFileSync(tmpFile, `${name}=${value}\n`);

  const args = ["convex", "env", "set", "--from-file", tmpFile, "--force"];
  if (isPreview && previewName) {
    args.splice(3, 0, "--preview-name", previewName);
  }

  console.log(`Setting ${name} on Convex...`);
  const result = spawnSync("npx", args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to set ${name} (exit code ${result.status})`);
  }

  // Clean up
  try { unlinkSync(tmpFile); } catch (_) { /* ignore */ }
}

// Determine SITE_URL
let siteUrl = process.env.SITE_URL;
if (isPreview && process.env.VERCEL_BRANCH_URL) {
  siteUrl = `https://${process.env.VERCEL_BRANCH_URL}`;
} else if (isProduction && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
}

if (siteUrl) {
  setConvexEnv("SITE_URL", siteUrl);
}

if (process.env.JWT_PRIVATE_KEY) {
  setConvexEnv("JWT_PRIVATE_KEY", process.env.JWT_PRIVATE_KEY);
}

if (process.env.JWKS) {
  setConvexEnv("JWKS", process.env.JWKS);
}
