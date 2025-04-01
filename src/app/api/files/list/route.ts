// src/app/api/files/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { resolvePath } from "@/lib/utils/path";

// Define the root directory for STL files
// In production, use env variable to set this path
const ROOT_DIR = process.env.STL_ROOT_DIR || path.join(process.cwd(), "public/models");

console.log("Using models directory:", ROOT_DIR);

// Define file/folder types
interface FileItem {
  name: string;
  path: string;
  type: "file";
  extension: string;
  size: number;
  modified: string;
}

interface FolderItem {
  name: string;
  path: string;
  type: "folder";
  itemCount: number;
  previewPath?: string;
}

type FileSystemItem = FileItem | FolderItem;

export async function GET(request: NextRequest) {
  try {
    // Get the folder path from the query parameter
    const searchParams = request.nextUrl.searchParams;
    const folderPath = searchParams.get("path") || "";

    // Full path to the requested directory
    const fullPath = resolvePath(ROOT_DIR, folderPath);

    // Check if the path exists and is a directory
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return NextResponse.json({ error: "Not a directory" }, { status: 400 });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 });
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

          const folderItem: FolderItem = {
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

          const fileItem: FileItem = {
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

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
