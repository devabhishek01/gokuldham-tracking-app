/**
 * ResqTrack 24/7 Background GPS Collector Daemon
 *
 * This daemon runs continuously as a background service to fetch vehicle
 * telemetry from Millitrack/Traccar GPS servers and persist coordinates into
 * PostgreSQL database (gps_history table).
 *
 * Usage:
 *   node scripts/gps-daemon.js
 *   npm run daemon
 *   pm2 start ecosystem.config.js
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Load environment variables (.env.production or .env.local)
function loadEnv() {
  const envFiles = [".env.production", ".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = join(rootDir, file);
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            const value = trimmed.substring(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      console.log(`[GPS Daemon] 📄 Loaded environment from ${file}`);
      break;
    }
  }
}

loadEnv();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Admin123@localhost:5432/gokuldham_app";
const MILLITRACK_EMAIL = process.env.MILLITRACK_EMAIL || "gokulk01";
const MILLITRACK_PASSWORD = process.env.MILLITRACK_PASSWORD || "123456";
const POLL_INTERVAL_MS = parseInt(process.env.GPS_POLL_INTERVAL_MS || "10000", 10);

// Initialize Postgres Connection Pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    DATABASE_URL.includes("neon.tech") || DATABASE_URL.includes("amazonaws")
      ? { rejectUnauthorized: false }
      : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[GPS Daemon] ⚠️ Unexpected database pool error:", err.message);
});

let isRunning = false;
let totalPollCount = 0;
let totalSavedPoints = 0;

/**
 * Fetch devices and positions directly from Remote Millitrack API
 */
async function fetchRemoteGpsData() {
  const authHeader =
    "Basic " + Buffer.from(`${MILLITRACK_EMAIL}:${MILLITRACK_PASSWORD}`).toString("base64");
  const headers = {
    Authorization: authHeader,
    Accept: "application/json",
  };

  const [devRes, posRes] = await Promise.all([
    fetch("http://track2.millitrack.com/api/devices", { headers, cache: "no-store" }),
    fetch("http://track2.millitrack.com/api/positions", { headers, cache: "no-store" }),
  ]);

  if (!devRes.ok || !posRes.ok) {
    throw new Error(`Millitrack HTTP status: devices (${devRes.status}) / positions (${posRes.status})`);
  }

  const devices = await devRes.json();
  const positions = await posRes.json();

  if (!Array.isArray(devices) || !Array.isArray(positions)) {
    throw new Error("Invalid array response from Millitrack API");
  }

  const posMap = new Map();
  positions.forEach((p) => {
    if (p && p.deviceId) posMap.set(p.deviceId, p);
  });

  return devices.map((d) => {
    const pos = posMap.get(d.id) || {};
    return {
      id: d.id,
      name: d.name,
      deviceUniqueId: d.uniqueId,
      latitude: pos.latitude || 0,
      longitude: pos.longitude || 0,
      speed: pos.speed || 0,
      course: pos.course || 0,
      address: pos.address || d.address || "",
      attributes: {
        ...(pos.attributes || {}),
        ignition: pos.attributes?.ignition ?? false,
        motion: pos.attributes?.motion ?? false,
        charge: pos.attributes?.charge ?? false,
        batteryLevel: pos.attributes?.batteryLevel ?? null,
      },
      serverTime: pos.serverTime || d.lastUpdate || new Date().toISOString(),
    };
  });
}

/**
 * Persist GPS Telemetry Points into PostgreSQL Table `gps_history`
 */
async function saveGpsPointsToDatabase(devices) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  let newPointsCount = 0;

  for (const device of devices) {
    const id = device.deviceUniqueId;
    if (!id || (device.latitude === 0 && device.longitude === 0)) continue;

    try {
      const existingRes = await pool.query(
        "SELECT points FROM gps_history WHERE device_id = $1 AND date_str = $2",
        [id, dateStr]
      );

      let rawPoints = existingRes.rows.length > 0 ? existingRes.rows[0].points : [];
      let points = Array.isArray(rawPoints)
        ? rawPoints
        : typeof rawPoints === "string"
        ? JSON.parse(rawPoints)
        : [];
      const lastPoint = points[points.length - 1];

      // Add point if location moved or telemetry status changed
      const hasMovedOrChanged =
        !lastPoint ||
        Math.abs(lastPoint.latitude - device.latitude) > 0.00002 ||
        Math.abs(lastPoint.longitude - device.longitude) > 0.00002 ||
        Math.abs(lastPoint.speed - device.speed) > 2 ||
        lastPoint.ignition !== device.attributes?.ignition;

      if (hasMovedOrChanged) {
        points.push({
          latitude: device.latitude,
          longitude: device.longitude,
          speed: device.speed,
          course: device.course || 0,
          ignition: device.attributes?.ignition === true,
          battery: device.attributes?.batteryLevel || null,
          timestamp: now.toISOString(),
        });

        await pool.query(
          `INSERT INTO gps_history (device_id, date_str, points, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (device_id, date_str)
           DO UPDATE SET points = $3::jsonb, updated_at = NOW()`,
          [id, dateStr, JSON.stringify(points)]
        );
        newPointsCount++;
      }
    } catch (dbErr) {
      console.error(`[GPS Daemon] ❌ Error saving points for device ${id}:`, dbErr.message);
    }
  }

  return newPointsCount;
}

/**
 * Single Polling Cycle Execution
 */
async function pollCycle() {
  if (isRunning) return;
  isRunning = true;
  totalPollCount++;

  const cycleStartTime = Date.now();
  const timestamp = new Date().toLocaleTimeString("en-IN", { hour12: false });

  try {
    const devices = await fetchRemoteGpsData();
    const saved = await saveGpsPointsToDatabase(devices);
    totalSavedPoints += saved;
    const durationMs = Date.now() - cycleStartTime;

    console.log(
      `[${timestamp}] 📡 Cycle #${totalPollCount} OK | Remote Vehicles: ${devices.length} | Points Saved: ${saved} | (${durationMs}ms)`
    );
  } catch (err) {
    console.warn(
      `[${timestamp}] ⚠️ Cycle #${totalPollCount} Warning: ${err.message}. Retrying next cycle...`
    );
  } finally {
    isRunning = false;
  }
}

/**
 * Start 24/7 Daemon Service
 */
function startDaemon() {
  console.log("\n=======================================================");
  console.log("🚀 ResqTrack 24/7 Background GPS Data Collector Started");
  console.log("=======================================================");
  console.log(`📍 Database URL     : ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);
  console.log(`📡 Millitrack User  : ${MILLITRACK_EMAIL}`);
  console.log(`⏱️  Poll Interval    : ${POLL_INTERVAL_MS / 1000}s`);
  console.log("-------------------------------------------------------\n");

  // Initial immediate poll
  pollCycle();

  // Set recurring interval
  const intervalHandle = setInterval(pollCycle, POLL_INTERVAL_MS);

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[GPS Daemon] 🛑 Received ${signal}. Shutting down gracefully...`);
    clearInterval(intervalHandle);
    try {
      await pool.end();
      console.log(`[GPS Daemon] ✅ Postgres connection pool closed. Total Cycles: ${totalPollCount}, Total Points Saved: ${totalSavedPoints}.`);
      process.exit(0);
    } catch (err) {
      console.error("[GPS Daemon] Error during shutdown:", err.message);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startDaemon();
