// src/lib/db/updateSchema.ts
import { getDb } from "../metadata/database";

/**
 * Update the database schema to include missing columns
 */
export async function updateDatabaseSchema(): Promise<void> {
  const db = await getDb();

  // Check if the print_settings column exists
  const tableInfo = db.prepare("PRAGMA table_info(metadata)").all() as { name: string }[];
  const hasPrintSettings = tableInfo.some((col) => col.name === "print_settings");

  // If the column doesn't exist, add it
  if (!hasPrintSettings) {
    console.log("Adding print_settings column to metadata table");
    db.prepare("ALTER TABLE metadata ADD COLUMN print_settings TEXT").run();
  }

  console.log("Database schema updated successfully");
}
