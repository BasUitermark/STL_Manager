// src/lib/metadata/metadata.ts
import { getDb } from "./database";
import {
  FileMetadata,
  MetadataInput,
  MetadataQueryOptions,
  PrintSettings,
} from "@/components/metadata/metadata.types";

/**
 * Get metadata for a file by its path
 */
export async function getMetadataByPath(filePath: string): Promise<FileMetadata | null> {
  const db = await getDb();

  // Get the base metadata
  const metadata = db
    .prepare(
      `
    SELECT 
      id, file_path as filePath, file_name as fileName, 
      file_type as fileType, parent_folder_id as parentFolderId,
      description, date_added as dateAdded, 
      last_modified as lastModified, resin, 
      layer_height as layerHeight, 
      supports_needed as supportsNeeded, 
      notes, print_settings as printSettingsJson
    FROM metadata 
    WHERE file_path = ?
  `
    )
    .get(filePath) as
    | (Omit<FileMetadata, "tags" | "printSettings"> & {
        id: number;
        printSettingsJson?: string;
      })
    | undefined;

  if (!metadata) return null;

  // Get the tags for this file
  const tags = db
    .prepare(
      `
    SELECT t.name
    FROM tags t
    JOIN file_tags ft ON t.id = ft.tag_id
    WHERE ft.file_id = ?
  `
    )
    .all(metadata.id) as { name: string }[];

  // Parse print settings JSON if exists
  let printSettings: PrintSettings | undefined;
  if (metadata.printSettingsJson) {
    try {
      printSettings = JSON.parse(metadata.printSettingsJson);
    } catch (e) {
      console.error("Error parsing print settings JSON:", e);
    }
  }

  // Omit the printSettingsJson field and add the parsed printSettings
  const { printSettingsJson, ...rest } = metadata;

  return {
    ...rest,
    tags: tags.map((t) => t.name),
    supportsNeeded: Boolean(metadata.supportsNeeded),
    printSettings,
  };
}

/**
 * Create or update metadata for a file
 */
export async function saveMetadata(metadata: MetadataInput): Promise<FileMetadata> {
  const db = await getDb();
  const now = new Date().toISOString();

  // Use provided dates or default to current time
  const dateAdded = metadata.dateAdded || now;
  const lastModified = metadata.lastModified || now;

  // Convert print settings to JSON if exists
  const printSettingsJson = metadata.printSettings ? JSON.stringify(metadata.printSettings) : null;

  // Check if the file already has metadata
  const existing = db
    .prepare("SELECT id FROM metadata WHERE file_path = ?")
    .get(metadata.filePath) as { id: number } | undefined;

  let fileId: number;

  // If it exists, update it
  if (existing) {
    db.prepare(
      `
		UPDATE metadata SET
		  file_name = ?,
		  file_type = ?,
		  parent_folder_id = ?,
		  description = ?,
		  last_modified = ?,
		  resin = ?,
		  layer_height = ?,
		  supports_needed = ?,
		  notes = ?,
		  print_settings = ?
		WHERE file_path = ?
	  `
    ).run(
      metadata.fileName,
      metadata.fileType,
      metadata.parentFolderId,
      metadata.description,
      lastModified,
      metadata.resin,
      metadata.layerHeight,
      metadata.supportsNeeded ? 1 : 0,
      metadata.notes,
      printSettingsJson,
      metadata.filePath
    );

    fileId = existing.id;
  } else {
    // Otherwise, create a new record
    const result = db
      .prepare(
        `
		INSERT INTO metadata (
		  file_path, file_name, file_type, parent_folder_id, description, 
		  date_added, last_modified, resin, layer_height, 
		  supports_needed, notes, print_settings
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	  `
      )
      .run(
        metadata.filePath,
        metadata.fileName,
        metadata.fileType,
        metadata.parentFolderId,
        metadata.description,
        dateAdded,
        lastModified,
        metadata.resin,
        metadata.layerHeight,
        metadata.supportsNeeded ? 1 : 0,
        metadata.notes,
        printSettingsJson
      );

    fileId = result.lastInsertRowid as number;
  }

  // Clear existing tags for this file
  db.prepare("DELETE FROM file_tags WHERE file_id = ?").run(fileId);

  // Add each tag
  for (const tagName of metadata.tags) {
    // Get or create the tag
    const tagId = await getOrCreateTag(tagName);

    // Link the tag to the file
    db.prepare("INSERT OR IGNORE INTO file_tags (file_id, tag_id) VALUES (?, ?)").run(
      fileId,
      tagId
    );
  }

  // Return the updated metadata
  return (await getMetadataByPath(metadata.filePath)) as FileMetadata;
}

/**
 * Get or create a tag, returning its ID
 */
async function getOrCreateTag(tagName: string): Promise<number> {
  const db = await getDb();

  // Try to get the existing tag
  const tag = db.prepare("SELECT id FROM tags WHERE name = ?").get(tagName) as
    | { id: number }
    | undefined;

  if (tag) {
    return tag.id;
  }

  // Create a new tag
  const result = db.prepare("INSERT INTO tags (name) VALUES (?)").run(tagName);

  return result.lastInsertRowid as number;
}

/**
 * Get all available tags
 */
export async function getAllTags(): Promise<string[]> {
  const db = await getDb();
  const tags = db.prepare("SELECT name FROM tags ORDER BY name").all() as { name: string }[];

  return tags.map((t) => t.name);
}

/**
 * Get all available file types
 */
export async function getAllFileTypes(): Promise<string[]> {
  const db = await getDb();
  const types = db
    .prepare(
      "SELECT DISTINCT file_type FROM metadata WHERE file_type IS NOT NULL ORDER BY file_type"
    )
    .all() as { file_type: string }[];

  return types.map((t) => t.file_type);
}

/**
 * Query metadata based on search criteria
 */
export async function queryMetadata(options: MetadataQueryOptions = {}): Promise<FileMetadata[]> {
  const db = await getDb();

  let query = `
    SELECT DISTINCT
      m.id, m.file_path as filePath, m.file_name as fileName, 
      m.file_type as fileType, m.parent_folder_id as parentFolderId,
      m.description, m.date_added as dateAdded, 
      m.last_modified as lastModified, m.resin, 
      m.layer_height as layerHeight, 
      m.supports_needed as supportsNeeded, 
      m.notes, m.print_settings as printSettingsJson
    FROM metadata m
  `;

  const params: string[] = [];
  const conditions: string[] = [];

  // Add tag filter if provided
  if (options.tags && options.tags.length > 0) {
    query += `
      JOIN file_tags ft ON m.id = ft.file_id
      JOIN tags t ON ft.tag_id = t.id
    `;
    conditions.push(`t.name IN (${options.tags.map(() => "?").join(", ")})`);
    params.push(...options.tags);
  }

  // Add file type filter if provided
  if (options.fileType) {
    conditions.push("m.file_type = ?");
    params.push(options.fileType);
  }

  // Add parent folder filter if provided
  if (options.parentFolder) {
    conditions.push("m.parent_folder_id = (SELECT id FROM metadata WHERE file_path = ?)");
    params.push(options.parentFolder);
  }

  // Add search filter if provided
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push("(m.file_name LIKE ? OR m.description LIKE ?)");
    params.push(searchTerm, searchTerm);
  }

  // Add WHERE clause if we have conditions
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Add order by
  query += " ORDER BY m.file_name";

  // Prepare the statement with all the parameters in order
  const stmt = db.prepare(query);
  let results;

  if (params.length > 0) {
    results = stmt.all(...params) as (Omit<FileMetadata, "tags" | "printSettings"> & {
      id: number;
      printSettingsJson?: string;
    })[];
  } else {
    results = stmt.all() as (Omit<FileMetadata, "tags" | "printSettings"> & {
      id: number;
      printSettingsJson?: string;
    })[];
  }

  // Fetch tags for each result and parse print settings
  const metadataWithTags: FileMetadata[] = [];

  for (const result of results) {
    const tags = db
      .prepare(
        `
      SELECT t.name
      FROM tags t
      JOIN file_tags ft ON t.id = ft.tag_id
      WHERE ft.file_id = ?
    `
      )
      .all(result.id) as { name: string }[];

    // Parse print settings JSON if exists
    let printSettings: PrintSettings | undefined;
    if (result.printSettingsJson) {
      try {
        printSettings = JSON.parse(result.printSettingsJson);
      } catch (e) {
        console.error("Error parsing print settings JSON:", e);
      }
    }

    // Omit the printSettingsJson field
    const { printSettingsJson, ...rest } = result;

    metadataWithTags.push({
      ...rest,
      tags: tags.map((t) => t.name),
      supportsNeeded: Boolean(result.supportsNeeded),
      printSettings,
    });
  }

  return metadataWithTags;
}

/**
 * Get information about a file's location in the folder hierarchy
 */
export async function getFileHierarchy(filePath: string): Promise<FileMetadata[]> {
  const db = await getDb();

  const hierarchy: FileMetadata[] = [];
  let currentMetadata = await getMetadataByPath(filePath);

  while (currentMetadata && currentMetadata.parentFolderId) {
    // Get the parent folder metadata
    const parentSql = `
      SELECT 
        id, file_path as filePath, file_name as fileName, 
        file_type as fileType, parent_folder_id as parentFolderId,
        description, date_added as dateAdded, 
        last_modified as lastModified
      FROM metadata 
      WHERE id = ?
    `;

    const parent = db.prepare(parentSql).get(currentMetadata.parentFolderId) as
      | (Omit<FileMetadata, "tags" | "supportsNeeded" | "printSettings"> & {
          id: number;
        })
      | undefined;

    if (!parent) break;

    // Get tags for the parent
    const tagsSql = `
      SELECT t.name
      FROM tags t
      JOIN file_tags ft ON t.id = ft.tag_id
      WHERE ft.file_id = ?
    `;

    const tags = db.prepare(tagsSql).all(parent.id) as { name: string }[];

    // Add to hierarchy
    hierarchy.push({
      ...parent,
      tags: tags.map((t) => t.name),
      supportsNeeded: false, // Default value for folders
    });

    // Move up to the parent
    currentMetadata = {
      ...parent,
      tags: tags.map((t) => t.name),
      supportsNeeded: false,
    };
  }

  // Return in order from root to immediate parent
  return hierarchy.reverse();
}
