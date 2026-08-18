import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const API_ROOT = "https://api.empiriolabs.ai/v1";
const PROMPT_ROOT = path.join(process.cwd(), "assets/generated/video-prompts");
const MASTER_DIR = path.join(process.cwd(), "assets/generated/first-frames/masters");
const POSTER_DIR = path.join(process.cwd(), "public/media/first-frames");
const OUTPUT_ROOT = path.join(process.cwd(), "assets/generated/video");
const IMAGE_BASE_URL = process.env.SEEDANCE_IMAGE_BASE_URL
  ?? "https://crystal-b2b.duckdns.org/media/first-frames";
const MODEL = process.env.SEEDANCE_MODEL ?? "seedance-2-5";
const RESOLUTION = process.env.SEEDANCE_RESOLUTION ?? "720p";
const DURATION = Number(process.env.SEEDANCE_DURATION ?? 6);
const ASPECT_RATIO = process.env.SEEDANCE_ASPECT_RATIO
  ?? (MODEL === "seedance-2-5" || MODEL === "bytedance/seedance-2.5" ? "adaptive" : "16:9");
const POLL_MS = 5_000;

const scenes = [
  { id: "01-hero", image: "01-hero-16x9.webp", master: "01-hero-16x9.png" },
  {
    id: "02-processes",
    image: "02-processes-system-cross-v2.webp",
    master: "02-processes-system-cross-v2.png",
    generationEnabled: false,
  },
  { id: "03-control-flow", image: "03-control-flow.webp", master: "03-control-flow.png" },
  { id: "04-connected-system", image: "04-connected-system.webp", master: "04-connected-system.png" },
  {
    id: "05-lighthouse",
    image: "05-lighthouse.webp",
    master: "05-lighthouse_a.png",
    imageEnd: "05-lighthouse_end.webp",
    masterEnd: "05-lighthouse_b-16x9.png",
  },
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const preflight = args.includes("--preflight");
const verifySources = args.includes("--verify-sources");
const all = args.includes("--all");
const sceneIndex = args.indexOf("--scene");
const requestedScene = sceneIndex >= 0 ? args[sceneIndex + 1] : undefined;
const promptProfileIndex = args.indexOf("--prompt-profile");
const requestedPromptProfile = promptProfileIndex >= 0 ? args[promptProfileIndex + 1] : undefined;
const promptProfile = requestedPromptProfile ?? process.env.SEEDANCE_PROMPT_PROFILE ?? "seedance-2.5";

if (!/^[a-z0-9][a-z0-9.-]*$/.test(promptProfile)) {
  console.error("Prompt profile must contain only lowercase letters, numbers, dots, or hyphens.");
  process.exit(1);
}

if (promptProfileIndex >= 0 && !requestedPromptProfile) {
  console.error("--prompt-profile requires a profile name, for example --prompt-profile seedance-2.5.");
  process.exit(1);
}

const PROMPT_DIR = path.join(PROMPT_ROOT, promptProfile);
const generationScenes = scenes.filter(({ generationEnabled = true }) => generationEnabled);

if (all && requestedScene) {
  console.error("Use either --all or --scene <id>, not both.");
  process.exit(1);
}

if (!all && !requestedScene && !preflight) {
  console.error("Choose one scene with --scene <id>, or explicitly pass --all.");
  console.error("Use --preflight to validate all enabled inputs without generating a video.");
  console.error(`Available scenes: ${generationScenes.map(({ id }) => id).join(", ")}`);
  process.exit(1);
}

if (!Number.isFinite(DURATION) || DURATION < 4 || DURATION > 30) {
  console.error("SEEDANCE_DURATION must be between 4 and 30 seconds.");
  process.exit(1);
}

const selectedScenes = all
  ? generationScenes
  : requestedScene
    ? scenes.filter(({ id }) => id === requestedScene)
    : generationScenes;

if (selectedScenes.length === 0) {
  console.error(`Unknown scene: ${requestedScene}`);
  process.exit(1);
}

if (selectedScenes.some(({ generationEnabled = true }) => !generationEnabled)) {
  console.error(`Scene is on hold and cannot be generated: ${requestedScene}`);
  process.exit(1);
}

const apiKey = process.env.EMPIRIOLABS_API_KEY;
if (!dryRun && !preflight && !apiKey) {
  console.error("EMPIRIOLABS_API_KEY is missing. Add it to .env.local or the shell environment.");
  process.exit(1);
}

const stamp = new Date().toISOString().replaceAll(":", "-").replace(".", "-");
const outputDir = path.join(OUTPUT_ROOT, stamp);

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function assertReadable(filePath, label) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Missing ${label}: ${path.relative(process.cwd(), filePath)}`);
  }
}

async function assertPosterIsCurrent(masterPath, posterPath) {
  const [master, poster] = await Promise.all([fs.stat(masterPath), fs.stat(posterPath)]);
  if (poster.mtimeMs < master.mtimeMs) {
    throw new Error(
      `First-frame poster is older than its master. Re-export the WebP before generating: ${path.relative(process.cwd(), posterPath)}`,
    );
  }
}

async function readPngDimensions(filePath) {
  const bytes = await fs.readFile(filePath);
  const signature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== signature) {
    throw new Error(`First/last frame must be a PNG master: ${path.relative(process.cwd(), filePath)}`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function assertMatchingFirstLastAspect(firstMasterPath, endMasterPath) {
  const [first, end] = await Promise.all([
    readPngDimensions(firstMasterPath),
    readPngDimensions(endMasterPath),
  ]);
  if (first.width * end.height !== first.height * end.width) {
    throw new Error(
      `First/last frame aspect ratio mismatch (${first.width}x${first.height} vs ${end.width}x${end.height}). Reframe the end master to the exact first-frame ratio before i2v_both.`,
    );
  }
}

async function verifyRemoteSource(scene) {
  const sourceUrl = `${IMAGE_BASE_URL}/${scene.image}`;
  let response = await fetch(sourceUrl, { method: "HEAD" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    response = await fetch(sourceUrl, { method: "GET" });
  }
  if (!response.ok) throw new Error(`Source image is not publicly reachable (${response.status}): ${sourceUrl}`);
  if (!response.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(`Source image has an unexpected content type: ${sourceUrl}`);
  }
  return sourceUrl;
}

async function validateScene(scene) {
  const promptPath = path.join(PROMPT_DIR, `${scene.id}.txt`);
  const posterPath = path.join(POSTER_DIR, scene.image);
  const masterPath = path.join(MASTER_DIR, scene.master);
  const endPosterPath = scene.imageEnd ? path.join(POSTER_DIR, scene.imageEnd) : undefined;
  const endMasterPath = scene.masterEnd ? path.join(MASTER_DIR, scene.masterEnd) : undefined;
  await Promise.all([
    assertReadable(promptPath, "scene prompt"),
    assertReadable(posterPath, "optimized first frame"),
    assertReadable(masterPath, "PNG master"),
    ...(endMasterPath ? [assertReadable(endMasterPath, "PNG last-frame master")] : []),
  ]);
  if (endMasterPath) await assertMatchingFirstLastAspect(masterPath, endMasterPath);
  if (endPosterPath) await assertReadable(endPosterPath, "optimized last frame");
  await assertPosterIsCurrent(masterPath, posterPath);
  if (endMasterPath && endPosterPath) await assertPosterIsCurrent(endMasterPath, endPosterPath);
  const prompt = (await fs.readFile(promptPath, "utf8")).trim();
  if (!prompt) throw new Error(`Scene prompt is empty: ${path.relative(process.cwd(), promptPath)}`);
  const sourceUrl = verifySources ? await verifyRemoteSource(scene) : `${IMAGE_BASE_URL}/${scene.image}`;
  const endSourceUrl = scene.imageEnd
    ? verifySources
      ? await verifyRemoteSource({ ...scene, image: scene.imageEnd })
      : `${IMAGE_BASE_URL}/${scene.imageEnd}`
    : undefined;
  return { prompt, sourceUrl, endSourceUrl };
}

async function apiRequest(endpoint, init = {}) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(body)}`);
  }
  return body;
}

function getJobId(body) {
  return body.job_id ?? body.id ?? body.data?.job_id ?? body.data?.id;
}

function getStatus(body) {
  return String(body.status ?? body.state ?? body.data?.status ?? body.data?.state ?? "").toLowerCase();
}

function getVideoUrl(body) {
  const candidates = [
    body.output?.[0]?.url,
    body.output?.url,
    body.result?.output?.[0]?.url,
    body.result?.data?.[0]?.url,
    body.result?.url,
    body.result?.result?.output?.[0]?.url,
    body.result?.result?.data?.[0]?.url,
    body.result?.result?.url,
    body.data?.output?.[0]?.url,
    body.data?.[0]?.url,
    body.data?.url,
    body.video?.url,
    body.video_url,
    body.output_url,
  ];
  return candidates.find((value) => typeof value === "string" && value.startsWith("http"));
}

async function pollJob(jobId) {
  for (;;) {
    const job = await apiRequest(`/jobs/${encodeURIComponent(jobId)}`);
    const status = getStatus(job);
    console.log(`[${jobId}] ${status || "pending"}`);
    if (["completed", "complete", "succeeded", "success", "done"].includes(status)) return job;
    if (["failed", "error", "cancelled", "canceled"].includes(status)) {
      throw new Error(`Generation ${jobId} ended with status ${status}: ${JSON.stringify(job)}`);
    }
    await delay(POLL_MS);
  }
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destination, bytes, { flag: "wx" });
}

const validatedScenes = new Map();
for (const scene of selectedScenes) {
  validatedScenes.set(scene.id, await validateScene(scene));
}

if (preflight) {
  for (const scene of selectedScenes) {
    const { sourceUrl } = validatedScenes.get(scene.id);
    console.log(`[preflight] ${scene.id}: ${promptProfile} prompt, PNG master and WebP poster are ready${verifySources ? `; source OK ${sourceUrl}` : ""}`);
  }
  process.exit(0);
}

if (!dryRun) await fs.mkdir(outputDir, { recursive: true });

for (const scene of selectedScenes) {
  const { prompt, sourceUrl } = validatedScenes.get(scene.id);
  const request = {
    model: MODEL,
    mode: scene.imageEnd ? "i2v_both" : "i2v_first",
    prompt,
    negative_prompt: "text, letters, logos, watermark, UI, morphing, geometry drift, new objects, camera shake, flicker, motion blur",
    image: sourceUrl,
    resolution: RESOLUTION,
    aspect_ratio: ASPECT_RATIO,
    custom_duration: true,
    duration: DURATION,
    generate_audio: false,
  };

  const { endSourceUrl } = validatedScenes.get(scene.id);
  if (endSourceUrl) request.image_end = endSourceUrl;

  if (dryRun) {
    console.log(`[dry-run] ${scene.id} (${promptProfile}): ${JSON.stringify(request, null, 2)}`);
    continue;
  }

  await fs.writeFile(
    path.join(outputDir, `${scene.id}.request.json`),
    `${JSON.stringify(request, null, 2)}\n`,
    { flag: "wx" },
  );

  console.log(`Submitting ${scene.id} with ${MODEL} at ${RESOLUTION} using ${promptProfile} prompts...`);
  const submission = await apiRequest("/videos/generations", {
    method: "POST",
    body: JSON.stringify(request),
  });
  const jobId = getJobId(submission);
  if (!jobId) throw new Error(`No job id returned for ${scene.id}: ${JSON.stringify(submission)}`);

  await fs.writeFile(
    path.join(outputDir, `${scene.id}.submission.json`),
    `${JSON.stringify(submission, null, 2)}\n`,
    { flag: "wx" },
  );

  const job = await pollJob(jobId);
  await fs.writeFile(
    path.join(outputDir, `${scene.id}.job.json`),
    `${JSON.stringify(job, null, 2)}\n`,
    { flag: "wx" },
  );

  const videoUrl = getVideoUrl(job);
  if (!videoUrl) throw new Error(`No video URL found for ${scene.id}: ${JSON.stringify(job)}`);
  const destination = path.join(outputDir, `${scene.id}.mp4`);
  await download(videoUrl, destination);
  console.log(`Saved ${destination}`);
}

if (!dryRun) console.log(`Run artifacts: ${outputDir}`);
