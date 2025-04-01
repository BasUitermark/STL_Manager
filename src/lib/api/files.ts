// src/lib/api/files.ts
import { FileSystemItem } from "@/types/file";

/**
 * Fetches the list of files and folders at the specified path
 * @param folderPath The path to fetch contents from, empty for root
 */
export async function listFilesAndFolders(folderPath: string = ""): Promise<FileSystemItem[]> {
  const response = await fetch(`/api/files/list?path=${encodeURIComponent(folderPath)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to list files and folders");
  }

  return response.json();
}

/**
 * Gets the URL for a file preview
 * @param filePath Path to the file
 */
export function getPreviewUrl(filePath: string): string {
  return `/api/files/preview?path=${encodeURIComponent(filePath)}`;
}

/**
 * Gets the URL for an STL file to be loaded into the viewer
 * @param filePath Path to the STL file
 */
export function getStlUrl(filePath: string): string {
  return `/api/files/preview?path=${encodeURIComponent(filePath)}`;
}
