// src/lib/metadata/initDatabase.ts
import { initDatabase } from "./database";
import { createSchema } from "./schema";
import { synchronizeFileSystem } from "@/lib/fs/fileSynchronizer";

/**
 * Initialize the database with a fresh schema and synchronize with file system
 */
export async function initDb() {
  console.log("Initializing database...");
  try {
    // Initialize the database connection
    const db = await initDatabase();

    // Create fresh schema
    await createSchema();

    // Sync with file system - use environment variable for root directory
    const rootDir = process.env.STL_ROOT_DIR || "./public/models";
    console.log(`Synchronizing with file system at ${rootDir}...`);
    const syncStats = await synchronizeFileSystem(rootDir);

    console.log(`Synchronization complete:
      - ${syncStats.added} files/folders added
      - ${syncStats.updated} files/folders updated
      - ${syncStats.removed} files/folders removed
      - ${syncStats.total} total files/folders in system`);

    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
