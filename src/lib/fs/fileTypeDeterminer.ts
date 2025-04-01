// src/lib/fs/fileTypeDeterminer.ts
import path from "path";
import { FileTypes, FileType } from "@/lib/metadata/fileTypes";

/**
 * Determines the appropriate file type based on file path, name, and whether it's a directory
 */
export function determineFileType(
  filePath: string,
  isDirectory: boolean,
  extension?: string
): FileType {
  const pathParts = filePath.split(path.sep).filter(Boolean);
  const depth = pathParts.length;
  const fileName = path.basename(filePath);

  // Handle directories based on depth and naming conventions
  if (isDirectory) {
    // Root directory
    if (depth === 0) return FileTypes.ROOT;

    // First level - likely publisher
    if (depth === 1) return FileTypes.PUBLISHER;

    // Second level - likely collection/pack
    if (depth === 2) return FileTypes.COLLECTION;

    // Check for variant folders at any level
    if (["Supported", "Unsupported", "Parts", "Split"].includes(fileName)) {
      return FileTypes.VARIANT;
    }

    // Third level - likely a model unless it's a variant folder
    if (depth === 3) {
      return FileTypes.MODEL;
    }

    // Deeper levels - most likely variant folders or model folders
    return FileTypes.VARIANT;
  }

  // Handle files based on extension
  if (extension) {
    switch (extension.toLowerCase()) {
      case "stl":
        return FileTypes.STL;
      case "lys":
        return FileTypes.SLICE;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return FileTypes.IMAGE;
      case "pdf":
      case "txt":
      case "md":
        return FileTypes.DOCUMENT;
      default:
        return FileTypes.UNKNOWN;
    }
  }

  return FileTypes.UNKNOWN;
}
