// src/lib/fs/fileSynchronizer.ts
import path from "path";
import { scanFileSystem, FileEntry } from "./fileScanner";
import { determineFileType } from "./fileTypeDeterminer";
import { getDb } from "@/lib/metadata/database";
import { MetadataInput } from "@/components/metadata/metadata.types";

interface SyncStats {
  added: number;
  updated: number;
  removed: number;
  total: number;
}

/**
 * Synchronizes the file system with the database
 */
export async function synchronizeFileSystem(rootDir: string): Promise<SyncStats> {
  // Step 1: Scan file system
  console.log("Scanning file system...");
  const fileEntries = await scanFileSystem(rootDir);

  // Step 2: Build a map for easier access
  const fileSystemMap = new Map<string, FileEntry>();
  fileEntries.forEach((entry) => {
    fileSystemMap.set(entry.path, entry);
  });

  // Step 3: Get current database entries
  const db = await getDb();
  const dbEntries = db
    .prepare("SELECT id, file_path, file_name, last_modified FROM metadata")
    .all() as { id: number; file_path: string; file_name: string; last_modified: string }[];

  // Step 4: Build a map of database entries
  const databaseMap = new Map<string, { id: number; last_modified: string }>();
  dbEntries.forEach((entry) => {
    databaseMap.set(entry.file_path, { id: entry.id, last_modified: entry.last_modified });
  });

  // Step 5: Find entries to add, update, or remove
  const entriesToAdd: MetadataInput[] = [];
  const entriesToUpdate: { id: number; lastModified: string }[] = [];
  const entriesToRemove: number[] = [];

  // Find new entries
  for (const [filePath, entry] of fileSystemMap.entries()) {
    if (!databaseMap.has(filePath)) {
      const now = new Date().toISOString();
      entriesToAdd.push({
        filePath,
        fileName: entry.name,
        fileType: determineFileType(filePath, entry.isDirectory, entry.extension),
        tags: [], // No tags yet
        supportsNeeded: false,
        dateAdded: now,
        lastModified: entry.modified.toISOString(),
      });
    } else {
      // Check if modified time is newer
      const dbEntry = databaseMap.get(filePath)!;
      const dbModified = new Date(dbEntry.last_modified);

      if (entry.modified > dbModified) {
        entriesToUpdate.push({
          id: dbEntry.id,
          lastModified: entry.modified.toISOString(),
        });
      }
    }
  }

  // Find entries to remove
  for (const [filePath, dbEntry] of databaseMap.entries()) {
    if (!fileSystemMap.has(filePath)) {
      entriesToRemove.push(dbEntry.id);
    }
  }

  // Step 6: Apply changes to database
  console.log(
    `Found ${entriesToAdd.length} entries to add, ${entriesToUpdate.length} to update, and ${entriesToRemove.length} to remove`
  );
  await applyDatabaseChanges(entriesToAdd, entriesToUpdate, entriesToRemove);

  // Step 7: Update parent-child relationships
  console.log("Updating parent-child relationships...");
  await updateParentChildRelationships();

  return {
    added: entriesToAdd.length,
    updated: entriesToUpdate.length,
    removed: entriesToRemove.length,
    total: fileEntries.length,
  };
}

/**
 * Applies database changes in a transaction
 */
async function applyDatabaseChanges(
  entriesToAdd: MetadataInput[],
  entriesToUpdate: { id: number; lastModified: string }[],
  entriesToRemove: number[]
): Promise<void> {
  const db = await getDb();

  try {
    // Start transaction
    db.exec("BEGIN TRANSACTION");

    // Add new entries in batches to avoid excessive memory usage
    const insertStmt = db.prepare(`
      INSERT INTO metadata (
        file_path, file_name, file_type, 
        date_added, last_modified
      ) VALUES (?, ?, ?, ?, ?)
    `);

    for (const entry of entriesToAdd) {
      insertStmt.run(
        entry.filePath,
        entry.fileName,
        entry.fileType,
        entry.dateAdded,
        entry.lastModified
      );
    }

    // Update modified entries
    const updateStmt = db.prepare(`
      UPDATE metadata SET last_modified = ? WHERE id = ?
    `);

    for (const entry of entriesToUpdate) {
      updateStmt.run(entry.lastModified, entry.id);
    }

    // Remove missing entries in batches
    const BATCH_SIZE = 500;
    for (let i = 0; i < entriesToRemove.length; i += BATCH_SIZE) {
      const batch = entriesToRemove.slice(i, i + BATCH_SIZE);
      if (batch.length > 0) {
        const placeholders = batch.map(() => "?").join(",");
        const deleteStmt = db.prepare(`DELETE FROM metadata WHERE id IN (${placeholders})`);
        deleteStmt.run(...batch);
      }
    }

    // Commit changes
    db.exec("COMMIT");
    console.log("Database changes applied successfully");
  } catch (error) {
    // Rollback on error
    db.exec("ROLLBACK");
    console.error("Error synchronizing database:", error);
    throw error;
  }
}

/**
 * Updates the parent-child relationships in the database
 */
async function updateParentChildRelationships(): Promise<void> {
  const db = await getDb();

  try {
    db.exec("BEGIN TRANSACTION");

    // For each entry in metadata, find its parent folder
    const allEntries = db.prepare("SELECT id, file_path FROM metadata").all() as {
      id: number;
      file_path: string;
    }[];

    const updateStmt = db.prepare("UPDATE metadata SET parent_folder_id = ? WHERE id = ?");
    const findParentStmt = db.prepare("SELECT id FROM metadata WHERE file_path = ?");

    for (const entry of allEntries) {
      // Skip root entries
      if (entry.file_path === "" || entry.file_path === ".") continue;

      const parentPath = path.dirname(entry.file_path);

      // If parent is empty or '.', this is a root item
      if (parentPath === "" || parentPath === ".") {
        updateStmt.run(null, entry.id);
        continue;
      }

      const parentEntry = findParentStmt.get(parentPath) as { id: number } | undefined;

      if (parentEntry) {
        updateStmt.run(parentEntry.id, entry.id);
      } else {
        updateStmt.run(null, entry.id);
      }
    }

    db.exec("COMMIT");
    console.log("Parent-child relationships updated successfully");
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error updating parent-child relationships:", error);
    throw error;
  }
}
