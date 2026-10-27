import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const FPS = 30;
const DURATION = 15.0; // seconds
const TOTAL_FRAMES = Math.round(DURATION * FPS); // 450 frames
const WIDTH = 1920;
const HEIGHT = 1080;

const FRAMES_DIR = path.resolve("./scripts/render_showreel/frames");
const HTML_FILE = "file://" + path.resolve("./scripts/render_showreel/showreel.html");
const AUDIO_FILE = path.resolve("./scripts/render_showreel/soundtrack.wav");
const OUTPUT_MP4 = path.resolve("./public/intro-showreel.mp4");

async function main() {
  console.log(`Starting Showreel render: ${TOTAL_FRAMES} frames at ${FPS} FPS...`);

  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  await page.goto(HTML_FILE, { waitUntil: "networkidle" });

  console.log("Capturing frames...");
  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;
    await page.evaluate((time) => {
      window.seek(time);
    }, t);

    const frameName = `frame_${String(frame).padStart(5, "0")}.png`;
    const framePath = path.join(FRAMES_DIR, frameName);
    await page.screenshot({ path: framePath, type: "png" });

    if (frame % 45 === 0 || frame === TOTAL_FRAMES - 1) {
      const pct = Math.round(((frame + 1) / TOTAL_FRAMES) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Rendered frame ${frame + 1}/${TOTAL_FRAMES} (${pct}%) [${elapsed}s]`);
    }
  }

  await browser.close();
  console.log("All frames captured. Encoding MP4 with FFmpeg and muxing audio...");

  // FFmpeg command to compile frames + mux soundtrack.wav into H.264 MP4
  const ffmpegCmd = `ffmpeg -y -r ${FPS} -i "${path.join(FRAMES_DIR, "frame_%05d.png")}" -i "${AUDIO_FILE}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 18 -c:a aac -b:a 192k -shortest "${OUTPUT_MP4}"`;

  execSync(ffmpegCmd, { stdio: "inherit" });
  console.log(`SUCCESS! Final MP4 created at: ${OUTPUT_MP4}`);

  // Cleanup frame files to save disk space
  const files = fs.readdirSync(FRAMES_DIR);
  for (const f of files) {
    fs.unlinkSync(path.join(FRAMES_DIR, f));
  }
  fs.rmdirSync(FRAMES_DIR);
  console.log("Temporary frames cleaned up.");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
