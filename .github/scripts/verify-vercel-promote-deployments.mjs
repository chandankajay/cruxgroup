import fs from "node:fs";

const DEPLOYMENT_URL_RE = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

const projectByApp = {
  web: process.env.PROJECT_ID_WEB,
  admin: process.env.PROJECT_ID_ADMIN,
  bookings: process.env.PROJECT_ID_BOOKINGS,
};

const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_ORG_ID;

if (!token || !teamId) {
  throw new Error("VERCEL_TOKEN and VERCEL_ORG_ID are required");
}

const manifest = JSON.parse(fs.readFileSync("promote-manifest.json", "utf8"));

for (const d of manifest.deployments ?? []) {
  const expectedProject = projectByApp[d.app];
  if (!expectedProject) {
    throw new Error(`No project id configured for app ${d.app}`);
  }

  const url = d.deployment_url;
  if (typeof url !== "string" || !DEPLOYMENT_URL_RE.test(url)) {
    throw new Error(`Invalid deployment URL for ${d.app}`);
  }

  const host = new URL(url).hostname;
  const apiUrl = new URL(`https://api.vercel.com/v13/deployments/${host}`);
  apiUrl.searchParams.set("teamId", teamId);

  const res = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Vercel API ${res.status} for ${d.app} (${host}): ${body.slice(0, 200)}`,
    );
  }

  const deployment = await res.json();

  if (deployment.projectId !== expectedProject) {
    throw new Error(
      `Deployment ${d.app} projectId mismatch (expected ${expectedProject}, got ${deployment.projectId})`,
    );
  }
  if (deployment.target !== "production") {
    throw new Error(
      `Deployment ${d.app} target is ${deployment.target}, expected production`,
    );
  }
  if (deployment.readyState !== "READY") {
    throw new Error(
      `Deployment ${d.app} readyState is ${deployment.readyState}, expected READY`,
    );
  }
}
