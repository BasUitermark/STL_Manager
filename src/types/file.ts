// src/types/file.ts
/**
 * Represents a file in the file system
 */
export interface FileItem {
  name: string;
  path: string;
  type: "file";
  extension: string;
  size: number;
  modified: string;
}

/**
 * Represents a folder in the file system
 */
export interface FolderItem {
  name: string;
  path: string;
  type: "folder";
  itemCount: number;
  previewPath?: string;
}

/**
 * Union type representing either a file or folder
 */
export type FileSystemItem = FileItem | FolderItem;

/**
 * Type guard to check if an item is a file
 */
export function isFileItem(item: FileSystemItem): item is FileItem {
  return item.type === "file";
}

/**
 * Type guard to check if an item is a folder
 */
export function isFolderItem(item: FileSystemItem): item is FolderItem {
  return item.type === "folder";
}
