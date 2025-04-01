// src/lib/metadata/schema.ts
import { getDb } from "./database";

/**
 * Create and initialize all database tables
 */
export async function createSchema() {
  const db = await getDb();

  // Metadata table with enhanced structure
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT UNIQUE NOT NULL, 
      file_name TEXT NOT NULL,
      file_type TEXT,                -- Type of file/folder: Publisher, Collection, Model, Variant, STL, Image, etc.
      parent_folder_id INTEGER,      -- Reference to parent folder
      description TEXT,
      date_added TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      resin TEXT,                    -- Print settings
      layer_height REAL,
      supports_needed INTEGER,
      notes TEXT,
      print_settings TEXT,           -- JSON storage for print settings
      FOREIGN KEY (parent_folder_id) REFERENCES metadata(id) ON DELETE CASCADE
    )
  `);

  // Tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // File tags relationship table
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_tags (
      file_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (file_id, tag_id),
      FOREIGN KEY (file_id) REFERENCES metadata(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for efficient querying
  db.exec(`
    -- Index for file path lookups
    CREATE INDEX IF NOT EXISTS idx_file_path ON metadata(file_path);
    
    -- Index for parent-child relationship traversal
    CREATE INDEX IF NOT EXISTS idx_parent_folder ON metadata(parent_folder_id);
    
    -- Index for file type filtering
    CREATE INDEX IF NOT EXISTS idx_file_type ON metadata(file_type);
  `);

  console.log("Database schema created successfully");
}
