// src/lib/utils/findScaleChart.ts
import { FileSystemItem, isFileItem } from "@/types/file";

/**
 * Finds a scale chart file in the current folder
 *
 * Looks for files with names like "scalechart", "scale_chart", "scale-chart", etc.
 * with common image extensions like .png, .jpg, etc.
 *
 * @param items Array of file system items in the current folder
 * @returns Path to the scale chart file, or null if none found
 */
export function findScaleChart(items: FileSystemItem[]): string | null {
  // Common scale chart name patterns
  const namePatterns = [
    "scalechart",
    "scale_chart",
    "scale-chart",
    "scale_reference",
    "scale",
    "sizechart",
    "size_chart",
    "size-chart",
    "sizeref",
    "size_reference",
  ];

  // Image extensions we should consider
  const imageExtensions = ["png", "jpg", "jpeg", "webp", "gif"];

  // Filter for files only
  const files = items.filter(isFileItem);

  // First, look for exact matches with common variations
  for (const pattern of namePatterns) {
    for (const ext of imageExtensions) {
      const exactMatch = files.find((file) => file.name.toLowerCase() === `${pattern}.${ext}`);

      if (exactMatch) {
        return exactMatch.path;
      }
    }
  }

  // Next, look for partial matches (files that contain the scale patterns)
  for (const pattern of namePatterns) {
    for (const file of files) {
      // Check if the filename (without extension) contains the pattern
      const fileNameLower = file.name.toLowerCase();
      const hasImageExt = imageExtensions.some((ext) => fileNameLower.endsWith(`.${ext}`));

      if (hasImageExt && fileNameLower.includes(pattern)) {
        return file.path;
      }
    }
  }

  // No scale chart found
  return null;
}
