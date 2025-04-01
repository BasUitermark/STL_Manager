// src/lib/metadata/fileTypes.ts

/**
 * Defines standard file types used in the application
 * These constants help maintain consistency when assigning file types
 */
export const FileTypes = {
  // Folder types (structural)
  PUBLISHER: "Publisher",
  COLLECTION: "Collection",
  MODEL: "Model",
  VARIANT: "Variant",

  // File types (content)
  STL: "STL File",
  SLICE: "Slicer File",
  IMAGE: "Image",
  DOCUMENT: "Document",

  // Other
  ROOT: "Root",
  UNKNOWN: "Unknown",
} as const;

// Type for use in TypeScript
export type FileType = (typeof FileTypes)[keyof typeof FileTypes];

/**
 * Determines if a file type is a folder type
 */
export function isFolderType(fileType: string): boolean {
  const folderTypes = [
    FileTypes.PUBLISHER,
    FileTypes.COLLECTION,
    FileTypes.MODEL,
    FileTypes.VARIANT,
    FileTypes.ROOT,
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return folderTypes.includes(fileType as any);
}
