// src/lib/utils/path.ts
import path from "path";

/**
 * Converts a Windows path (E:\Models) to a WSL path (/mnt/e/Models)
 * @param windowsPath The Windows-style path
 * @returns WSL-compatible path
 */
export function convertWindowsToWslPath(windowsPath: string): string {
  // If path already looks like a WSL or Unix path, return it
  if (windowsPath.startsWith("/")) {
    return windowsPath;
  }

  // Handle Windows drive letter paths (e.g., E:\Models)
  const match = windowsPath.match(/^([A-Za-z]):(.+)$/);
  if (match) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, driveLetter, remainingPath] = match;
    // Convert to WSL path format
    return `/mnt/${driveLetter.toLowerCase()}${remainingPath.replace(/\\/g, "/")}`;
  }

  // For relative paths or if not matching a drive pattern, just normalize
  return windowsPath.replace(/\\/g, "/");
}

/**
 * Resolves a path, handling WSL/Windows paths
 * @param basePath Base directory
 * @param relativePath Path relative to base
 * @returns Resolved path
 */
export function resolvePath(basePath: string, relativePath: string): string {
  // Convert Windows paths if needed
  const convertedBase = convertWindowsToWslPath(basePath);
  const normalized = path.join(convertedBase, relativePath);
  return normalized;
}
