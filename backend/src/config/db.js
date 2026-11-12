const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const fallbackStore = require("../db/fallbackStore");

// Ensure environment is loaded from standard locations
const envPaths = [
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
  path.join(__dirname, "..", "..", "..", ".env"),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

const connectionString = (process.env.DATABASE_URL || "").trim();
const isProduction = process.env.NODE_ENV === "production";

let realPool = null;
let isPostgresAvailable = false;

if (connectionString) {
  try {
    const poolConfig = {
      connectionString,
      ssl:
        connectionString.includes("sslmode=require") ||
        connectionString.includes(".pooler.supabase.com") ||
        connectionString.includes("neon.tech") ||
        isProduction
          ? { rejectUnauthorized: false }
          : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    realPool = new Pool(poolConfig);

    realPool
      .connect()
      .then((client) => {
        isPostgresAvailable = true;
        console.log("PostgreSQL Database Connected Successfully ✅");
        client.release();

        // Auto-patch missing columns on users and other tables
        realPool
          .query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
            ALTER TABLE sections ADD COLUMN IF NOT EXISTS order_num INTEGER DEFAULT 1;
            ALTER TABLE lectures ADD COLUMN IF NOT EXISTS order_num INTEGER DEFAULT 1;
            ALTER TABLE lectures ADD COLUMN IF NOT EXISTS lecture_number INTEGER DEFAULT 1;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS course_id INTEGER;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS course_code VARCHAR(255);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS batch VARCHAR(255);
          `)
          .catch((err) => console.warn("Schema auto-patch notice:", err.message));

        // Auto-check and synchronize full store if database is empty or missing courses (only outside serverless)
        if (!process.env.VERCEL) {
          setTimeout(async () => {
            try {
              const check = await realPool.query("SELECT COUNT(*) FROM courses");
              const count = parseInt(check.rows[0].count, 10);
              let targetCount = 17;
              try {
                const storePath = path.join(__dirname, "..", "..", "data", "lms_store.json");
                if (fs.existsSync(storePath)) {
                  const s = JSON.parse(fs.readFileSync(storePath, "utf8"));
                  if (Array.isArray(s.courses)) targetCount = s.courses.length;
                }
              } catch (e) {}

              if (count < targetCount) {
                console.log(`📦 Database has ${count} courses (< ${targetCount}). Auto-synchronizing full LMS database...`);
                const { syncDatabase } = require("../db/syncAllToDb");
                await syncDatabase(realPool);
              }
            } catch (autoSyncErr) {
              console.log("ℹ️ Tables uninitialized in PostgreSQL. Executing schema & initial sync...");
              try {
                const { syncDatabase } = require("../db/syncAllToDb");
                await syncDatabase(realPool);
              } catch (err2) {
                console.warn("⚠️ Auto-sync notice:", err2.message);
              }
            }
          }, 1500);
        }
      })
      .catch((error) => {
        isPostgresAvailable = false;
        console.warn(
          "⚠️ PostgreSQL Connection Notice (" +
            error.message +
            "). Running with Resilient In-Memory & Persistent Storage Fallback Engine."
        );
      });
  } catch (err) {
    isPostgresAvailable = false;
    console.warn("⚠️ Failed to initialize PostgreSQL Pool:", err.message);
  }
} else {
  console.log(
    "💡 DATABASE_URL not set in .env. Initializing LMS in High-Performance Local / In-Memory Mode with Seed Data."
  );
}

// Unified Direct & Resilient Pool Interface
const pool = {
  isPostgres: () => isPostgresAvailable,
  hasConfiguredDatabase: () => Boolean(connectionString),
  getRealPool: () => (isPostgresAvailable ? realPool : null),

  async query(text, params = []) {
    if (connectionString && realPool) {
      try {
        return await realPool.query(text, params);
      } catch (err) {
        if (
          err.message &&
          (err.message.includes('column "is_verified" does not exist') ||
            err.message.includes('column "verification_token" does not exist') ||
            err.message.includes('column "verification_token_expires" does not exist'))
        ) {
          console.log("⚡ Auto-patching missing verification columns on PostgreSQL...");
          try {
            await realPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;");
            await realPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);");
            await realPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;");
          } catch (patchErr) {
            console.warn("⚠️ Auto-patch verification columns notice:", patchErr.message);
          }
          return await realPool.query(text, params);
        }
        throw err;
      }
    }
    // A serverless filesystem is ephemeral. Never pretend that data has been
    // saved to a database when a production DATABASE_URL is absent.
    if (isProduction) {
      const error = new Error(
        "Persistent database is not configured. Set DATABASE_URL on the API deployment before creating or updating LMS data."
      );
      error.statusCode = 503;
      throw error;
    }
    // Only if DATABASE_URL is completely unset in dev, fallback to local store
    return await fallbackStore.handleQuery(text, params);
  },

  async connect() {
    if (connectionString && realPool) {
      const client = await realPool.connect();
      const origQuery = client.query.bind(client);
      client.query = async (...args) => {
        try {
          return await origQuery(...args);
        } catch (err) {
          if (
            err.message &&
            (err.message.includes('column "is_verified" does not exist') ||
              err.message.includes('column "verification_token" does not exist') ||
              err.message.includes('column "verification_token_expires" does not exist'))
          ) {
            console.log("⚡ Auto-patching missing verification columns via client connection...");
            await origQuery(`
              ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
              ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
              ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
            `).catch(() => {});
            return await origQuery(...args);
          }
          throw err;
        }
      };
      return client;
    }

    if (isProduction) {
      const error = new Error(
        "Persistent database is not configured. Set DATABASE_URL on the API deployment before creating or updating LMS data."
      );
      error.statusCode = 503;
      throw error;
    }

    // Mock client for transactions (BEGIN, COMMIT, ROLLBACK) and queries when no DB is configured
    return {
      query: async (text, params = []) => {
        return await fallbackStore.handleQuery(text, params);
      },
      release: () => {},
    };
  },

  on: (event, handler) => {
    if (realPool) realPool.on(event, handler);
  },

  end: async () => {
    if (realPool) await realPool.end();
  },
};

module.exports = pool;
