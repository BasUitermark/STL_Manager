import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getDb } from "@/lib/metadata/database";
import { FileTypes } from "@/lib/metadata/fileTypes";
import { FileItem, FolderItem } from "@/types/file";

// Define type for search results that includes match reason
type SearchResult = (FileItem | FolderItem) & {
  matchReason?: string;
};

// Root directory for files (used in actual implementation)
// const ROOT_DIR = process.env.STL_ROOT_DIR || path.join(process.cwd(), "public/models");

/**
 * GET /api/search
 * Advanced hierarchical search API with tag inheritance
 */
export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/search - Performing search");
    const searchParams = req.nextUrl.searchParams;

    // Extract search parameters
    const query = searchParams.get("query") || "";
    const tags = searchParams.getAll("tag");
    const fileType = searchParams.get("fileType");

    console.log("Search parameters:", { query, tags, fileType });

    // Skip search if no criteria provided
    if (!query && tags.length === 0 && !fileType) {
      return NextResponse.json([]);
    }

    // Get database connection
    const db = await getDb();

    // Find matching paths for each criteria
    const textMatchPaths = query ? await findPathsByText(query, db) : new Set<string>();
    const tagMatchPaths = tags.length > 0 ? await findPathsByTags(tags, db) : new Set<string>();
    const typeMatchPaths = fileType ? await findPathsByFileType(fileType, db) : new Set<string>();

    // Determine which criteria are active
    const hasTextCriteria = query !== "";
    const hasTagCriteria = tags.length > 0;
    const hasFileTypeCriteria = !!fileType;

    // Combine results based on active criteria (AND operation)
    let finalMatchPaths = new Set<string>();

    if (hasTextCriteria && hasTagCriteria && hasFileTypeCriteria) {
      // All three criteria - intersection of all matches
      finalMatchPaths = intersection(textMatchPaths, tagMatchPaths, typeMatchPaths);
    } else if (hasTextCriteria && hasTagCriteria) {
      // Text AND tags
      finalMatchPaths = intersection(textMatchPaths, tagMatchPaths);
    } else if (hasTextCriteria && hasFileTypeCriteria) {
      // Text AND file type
      finalMatchPaths = intersection(textMatchPaths, typeMatchPaths);
    } else if (hasTagCriteria && hasFileTypeCriteria) {
      // Tags AND file type
      finalMatchPaths = intersection(tagMatchPaths, typeMatchPaths);
    } else if (hasTextCriteria) {
      // Only text
      finalMatchPaths = textMatchPaths;
    } else if (hasTagCriteria) {
      // Only tags
      finalMatchPaths = tagMatchPaths;
    } else if (hasFileTypeCriteria) {
      // Only file type
      finalMatchPaths = typeMatchPaths;
    }

    // Convert paths to results and prioritize folder level
    const pathArray = Array.from(finalMatchPaths);

    // Log the matching paths
    console.log(`Found ${pathArray.length} matching paths`);

    // Get model folder paths (prioritize model folders)
    const modelFolderPaths = new Set<string>();

    for (const itemPath of pathArray) {
      // First, get the model folder for this path
      const modelPath = await findModelFolder(itemPath, db);
      if (modelPath) {
        modelFolderPaths.add(modelPath);
      } else {
        // If no model folder found, include the original path
        modelFolderPaths.add(itemPath);
      }
    }

    // Convert prioritized paths to results
    const results: SearchResult[] = [];
    const processedPaths = new Set<string>();

    for (const folderPath of modelFolderPaths) {
      if (processedPaths.has(folderPath)) continue;
      processedPaths.add(folderPath);

      // Generate match reason
      const matchReasons = [];
      if (hasTextCriteria && textMatchPaths.has(folderPath)) {
        matchReasons.push(`Matches "${query}"`);
      }
      if (hasTagCriteria && tagMatchPaths.has(folderPath)) {
        matchReasons.push(`Has tags: ${tags.join(", ")}`);
      }
      if (hasFileTypeCriteria && typeMatchPaths.has(folderPath)) {
        matchReasons.push(`Type: ${fileType}`);
      }

      // Get result info
      const folderInfo = await getFolderInfo(folderPath);
      if (folderInfo) {
        results.push({
          ...folderInfo,
          matchReason: matchReasons.join(", "),
        });
      }
    }

    console.log(`Returning ${results.length} search results`);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

/**
 * Find paths matching text search
 */
async function findPathsByText(query: string, db: any): Promise<Set<string>> {
  const matchPaths = new Set<string>();
  const lowerQuery = query.toLowerCase();

  // Search in file names and descriptions
  const textMatches = db
    .prepare(
      `
      SELECT file_path
      FROM metadata
      WHERE (
        LOWER(file_name) LIKE ? OR 
        LOWER(description) LIKE ? OR
        LOWER(notes) LIKE ?
      )
    `
    )
    .all(`%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`) as { file_path: string }[];

  // Add matching paths
  for (const { file_path } of textMatches) {
    matchPaths.add(file_path);
  }

  return matchPaths;
}

/**
 * Find paths matching tag search with inheritance
 */
async function findPathsByTags(tags: string[], db: any): Promise<Set<string>> {
  // We'll store matching paths for each tag
  const tagMatchSets: Set<string>[] = [];

  for (const tag of tags) {
    const matchesForTag = new Set<string>();

    // Find items directly tagged with this tag
    const taggedItems = db
      .prepare(
        `
        SELECT m.id, m.file_path
        FROM metadata m
        JOIN file_tags ft ON m.id = ft.file_id
        JOIN tags t ON ft.tag_id = t.id
        WHERE t.name = ?
      `
      )
      .all(tag) as { id: number; file_path: string }[];

    // For each tagged item
    for (const { id, file_path } of taggedItems) {
      // Add directly tagged item
      matchesForTag.add(file_path);

      // Find all descendants using recursive CTE
      try {
        const descendants = db
          .prepare(
            `
            WITH RECURSIVE descendants AS (
              -- Start with items that have this folder as direct parent
              SELECT id, file_path
              FROM metadata
              WHERE parent_folder_id = ?
              
              UNION ALL
              
              -- Recursively add items that have previous results as parents
              SELECT m.id, m.file_path
              FROM metadata m
              JOIN descendants d ON m.parent_folder_id = d.id
            )
            SELECT file_path FROM descendants
          `
          )
          .all(id) as { file_path: string }[];

        // Add all descendants - they inherit the tag
        for (const { file_path } of descendants) {
          matchesForTag.add(file_path);
        }
      } catch (error) {
        console.error(`Error finding descendants for ${file_path}:`, error);
        // Continue with other tagged items
      }
    }

    // Add this tag's matches to our collection
    tagMatchSets.push(matchesForTag);
  }

  // For multiple tags, find the intersection (items matching ALL tags)
  if (tagMatchSets.length === 0) {
    return new Set<string>();
  }

  // Start with the first tag's matches
  const result = tagMatchSets[0];

  // Intersect with each subsequent tag's matches
  for (let i = 1; i < tagMatchSets.length; i++) {
    // Keep only paths that are in both sets
    for (const path of result) {
      if (!tagMatchSets[i].has(path)) {
        result.delete(path);
      }
    }
  }

  return result;
}

/**
 * Find paths matching file type filter
 */
async function findPathsByFileType(fileType: string, db: any): Promise<Set<string>> {
  const matchPaths = new Set<string>();

  // Find items of the specified file type
  const typeMatches = db
    .prepare(
      `
      SELECT file_path
      FROM metadata
      WHERE file_type = ?
    `
    )
    .all(fileType) as { file_path: string }[];

  // Add matching paths
  for (const { file_path } of typeMatches) {
    matchPaths.add(file_path);
  }

  return matchPaths;
}

/**
 * Compute the intersection of multiple sets
 */
function intersection<T>(...sets: Set<T>[]): Set<T> {
  if (sets.length === 0) return new Set<T>();

  // Start with the first set
  const result = new Set(sets[0]);

  // Intersect with each additional set
  for (let i = 1; i < sets.length; i++) {
    for (const item of result) {
      if (!sets[i].has(item)) {
        result.delete(item);
      }
    }
  }

  return result;
}

/**
 * Find the model folder for a path
 * If the path is a model folder, returns the path itself
 * If the path is a descendant of a model folder, returns the model folder path
 * Otherwise returns null
 */
async function findModelFolder(itemPath: string, db: any): Promise<string | null> {
  // Check if this is already a model folder
  const fileType = db
    .prepare(
      `
      SELECT file_type
      FROM metadata
      WHERE file_path = ?
    `
    )
    .get(itemPath) as { file_type: string } | undefined;

  if (fileType && fileType.file_type === FileTypes.MODEL) {
    return itemPath;
  }

  // Find ancestors with recursive CTE
  const ancestors = db
    .prepare(
      `
      WITH RECURSIVE ancestors AS (
        -- Start with the current item
        SELECT id, file_path, file_type, parent_folder_id
        FROM metadata
        WHERE file_path = ?
        
        UNION ALL
        
        -- Recursively add parent items
        SELECT m.id, m.file_path, m.file_type, m.parent_folder_id
        FROM metadata m
        JOIN ancestors a ON m.id = a.parent_folder_id
      )
      SELECT file_path, file_type FROM ancestors
      WHERE file_type = ?
    `
    )
    .all(itemPath, FileTypes.MODEL) as { file_path: string; file_type: string }[];

  // Return the model folder if found
  if (ancestors.length > 0) {
    return ancestors[0].file_path;
  }

  // If no model folder found, return null
  return null;
}

/**
 * Get folder information for search results
 */
async function getFolderInfo(
  folderPath: string
): Promise<(FolderItem & { matchReason?: string }) | null> {
  try {
    const db = await getDb();

    // Get folder metadata from database
    const folderMetadata = db
      .prepare(
        `
        SELECT file_path, file_name, file_type
        FROM metadata
        WHERE file_path = ?
      `
      )
      .get(folderPath) as { file_path: string; file_name: string; file_type: string } | undefined;

    if (!folderMetadata) {
      // If not found in metadata, try to get basic info
      const folderName = path.basename(folderPath);
      return {
        name: folderName,
        path: folderPath,
        type: "folder",
        itemCount: 0,
      };
    }

    // Count items in folder
    const itemCount = db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM metadata
        WHERE parent_folder_id = (SELECT id FROM metadata WHERE file_path = ?)
      `
      )
      .get(folderPath) as { count: number } | undefined;

    // Find a preview image
    const previewImage = db
      .prepare(
        `
        SELECT file_path
        FROM metadata
        WHERE parent_folder_id = (SELECT id FROM metadata WHERE file_path = ?)
        AND (
          LOWER(file_path) LIKE '%.png' OR 
          LOWER(file_path) LIKE '%.jpg' OR 
          LOWER(file_path) LIKE '%.jpeg'
        )
        LIMIT 1
      `
      )
      .get(folderPath) as { file_path: string } | undefined;

    return {
      name: folderMetadata.file_name,
      path: folderMetadata.file_path,
      type: "folder",
      itemCount: itemCount?.count || 0,
      previewPath: previewImage?.file_path,
    };
  } catch (error) {
    console.error(`Error getting folder info for ${folderPath}:`, error);
    return null;
  }
}
