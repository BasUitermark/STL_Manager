// src/lib/fs/fileScanner.ts
import fs from "fs/promises";
import path from "path";

export interface FileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  modified: Date;
  extension?: string;
}

/**
 * Scans a directory and all its subdirectories, returning a list of all files and folders
 */
export async function scanFileSystem(rootDir: string): Promise<FileEntry[]> {
  const fileEntries: FileEntry[] = [];

  async function scanDirectory(dirPath: string, relativePath: string = "") {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      // Get file stats
      const stats = await fs.stat(fullPath);

      if (entry.isDirectory()) {
        // Add the directory itself
        fileEntries.push({
          path: entryRelativePath,
          name: entry.name,
          isDirectory: true,
          modified: stats.mtime,
        });

        // Recursively scan subdirectories
        await scanDirectory(fullPath, entryRelativePath);
      } else {
        // Add file
        fileEntries.push({
          path: entryRelativePath,
          name: entry.name,
          isDirectory: false,
          size: stats.size,
          modified: stats.mtime,
          extension: path.extname(entry.name).toLowerCase().substring(1),
        });
      }
    }
  }

  await scanDirectory(rootDir);
  return fileEntries;
}
