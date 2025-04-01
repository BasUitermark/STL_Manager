// src/lib/metadata/database.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs/promises";

// Define a global variable to store the database connection
let db: Database.Database | null = null;

/**
 * Initialize the SQLite database connection
 */
export async function initDatabase(): Promise<Database.Database> {
  if (db) return db;

  // Create the data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "stl-manager.db");

  // Open the database connection
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  return db;
}

/**
 * Get the database instance
 * @returns A promise that resolves to the database instance
 */
export async function getDb(): Promise<Database.Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
