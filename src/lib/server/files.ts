// src/lib/server/files.ts
import fs from "fs/promises";
import path from "path";
import { FileSystemItem } from "@/types/file";
import { resolvePath } from "@/lib/utils/path";

// Define the root directory for files
const ROOT_DIR = process.env.STL_ROOT_DIR || path.join(process.cwd(), "public/models");

/**
 * Server-side implementation to list files and folders
 * @param folderPath The path to list contents from, empty for root
 */
export async function listFilesAndFoldersServer(
  folderPath: string = ""
): Promise<FileSystemItem[]> {
  try {
    // Full path to the requested directory
    const fullPath = resolvePath(ROOT_DIR, folderPath);

    // Check if the path exists and is a directory
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        throw new Error("Not a directory");
      }
    } catch (error) {
      throw new Error("Directory not found");
    }

    // Read the directory contents
    const items = await fs.readdir(fullPath, { withFileTypes: true });

    // Process each item
    const results: FileSystemItem[] = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(folderPath, item.name);
        const fullItemPath = resolvePath(ROOT_DIR, itemPath);

        if (item.isDirectory()) {
          // It's a folder
          const dirContents = await fs.readdir(fullItemPath);

          // Look for a preview image (preview.png, preview.jpg, or first STL)
          let previewPath: string | undefined;

          // Check for standard preview images
          const previewFiles = [
            "preview.png",
            "preview.jpg",
            "preview.jpeg",
            "thumbnail.png",
            "thumbnail.jpg",
          ];
          for (const previewFile of previewFiles) {
            try {
              await fs.access(path.join(fullItemPath, previewFile));
              previewPath = path.join(itemPath, previewFile);
              break;
            } catch {
              // Preview doesn't exist, continue checking
            }
          }

          // If no standard preview, check for first STL file
          if (!previewPath) {
            const firstStl = dirContents.find((file) => file.toLowerCase().endsWith(".stl"));
            if (firstStl) {
              previewPath = path.join(itemPath, firstStl);
            }
          }

          const folderItem: FileSystemItem = {
            name: item.name,
            path: itemPath,
            type: "folder",
            itemCount: dirContents.length,
            previewPath,
          };

          return folderItem;
        } else {
          // It's a file
          const stats = await fs.stat(fullItemPath);
          const extension = path.extname(item.name).toLowerCase().substring(1);

          const fileItem: FileSystemItem = {
            name: item.name,
            path: itemPath,
            type: "file",
            extension,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          };

          return fileItem;
        }
      })
    );

    // Sort: folders first, then files, all alphabetically
    results.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });

    return results;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}
