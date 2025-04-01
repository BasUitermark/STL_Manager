// src/hooks/useFileExplorer.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FileSystemItem } from "@/types/file";
import { listFilesAndFolders } from "@/lib/api/files";

// Define loading states for better UI handling
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Custom hook for file explorer functionality with improved loading states
 */
export function useFileExplorer() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse path from URL on initial load
  useEffect(() => {
    const pathParam = searchParams.get("path") || "";
    setCurrentPath(pathParam);
  }, [searchParams]);

  // Load files and folders for the current path
  const loadItems = useCallback(
    async (path: string = currentPath) => {
      try {
        setLoadingState("loading");
        setError(null);

        const fetchedItems = await listFilesAndFolders(path);
        setItems(fetchedItems);
        setLoadingState("success");
      } catch (err) {
        console.error("Error loading files:", err);
        setError(err instanceof Error ? err.message : "Failed to load files");
        setItems([]);
        setLoadingState("error");
      }
    },
    [currentPath]
  ); // Remove currentPath dependency to avoid stale closures

  // Loading state derived property (for backwards compatibility)
  const loading = loadingState === "loading";

  // Load items when path changes
  useEffect(() => {
    loadItems(currentPath);
  }, [currentPath, loadItems]);

  // Navigate to a folder
  const navigateToFolder = useCallback(
    (folderPath: string) => {
      // Update URL
      const params = new URLSearchParams();
      params.set("path", folderPath);
      router.push(`${pathname}?${params.toString()}`);

      // Update state
      setCurrentPath(folderPath);
    },
    [pathname, router]
  );

  // Navigate to parent folder
  const navigateUp = useCallback(() => {
    if (!currentPath) return; // Already at root

    const parentPath = currentPath.split("/").slice(0, -1).join("/");
    navigateToFolder(parentPath);
  }, [currentPath, navigateToFolder]);

  // Create breadcrumb segments from the current path
  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [{ name: "Home", path: "" }];

    const segments = currentPath.split("/");
    return [
      { name: "Home", path: "" },
      ...segments.map((segment, index) => ({
        name: segment,
        path: segments.slice(0, index + 1).join("/"),
      })),
    ];
  }, [currentPath]);

  return {
    currentPath,
    items,
    loading,
    loadingState,
    error,
    loadItems,
    navigateToFolder,
    navigateUp,
    breadcrumbs,
  };
}
