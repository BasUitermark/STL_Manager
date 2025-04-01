// src/components/explorer/Explorer.tsx
import React, { useMemo } from "react";
import { isFolderItem, isFileItem } from "@/types/file";
import { FileCard } from "./FileCard";
import { FolderCard } from "./FolderCard";
import { FileItem, FolderItem, FileSystemItem } from "@/types/file";

interface ExplorerProps {
  items: FileSystemItem[];
  loading: boolean;
  navigateToFolder: (path: string) => void;
  onFileInfoClick?: (path: string) => void;
  onFolderInfoClick?: (path: string) => void;
  onFileEditClick?: (path: string, name: string) => void;
  onFolderEditClick?: (path: string, name: string) => void;
}

export function Explorer({
  items,
  loading,
  navigateToFolder,
  onFileInfoClick,
  onFolderInfoClick,
  onFileEditClick,
  onFolderEditClick,
}: ExplorerProps) {
  // Memoize folders and files to avoid unnecessary filtering on each render
  const folders = useMemo(() => items.filter(isFolderItem) as FolderItem[], [items]);
  const files = useMemo(() => items.filter(isFileItem) as FileItem[], [items]);

  // Loading state
  if (loading && items.length === 0) {
    return <LoadingIndicator />;
  }

  // Empty state
  if (folders.length === 0 && files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full space-y-8">
      {/* Folder Grid */}
      {folders.length > 0 && (
        <div className="w-full">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Folders {folders.length > 0 && `(${folders.length})`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {folders.map((folder) => (
              <div key={folder.path} className="h-full">
                <FolderCard
                  folder={folder}
                  onClick={navigateToFolder}
                  onInfoClick={onFolderInfoClick ? () => onFolderInfoClick(folder.path) : undefined}
                  onEditClick={
                    onFolderEditClick
                      ? () => onFolderEditClick(folder.path, folder.name)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Grid */}
      {files.length > 0 && (
        <div className="w-full">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Files {files.length > 0 && `(${files.length})`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {files.map((file) => (
              <div key={file.path} className="h-full">
                <FileCard
                  file={file}
                  onInfoClick={onFileInfoClick ? () => onFileInfoClick(file.path) : undefined}
                  onEditClick={
                    onFileEditClick ? () => onFileEditClick(file.path, file.name) : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Extract loading indicator to a separate component for better readability
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="animate-pulse flex flex-col items-center space-y-2">
        <svg
          className="animate-spin h-8 w-8 text-main-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-main-300">Loading files...</p>
      </div>
    </div>
  );
}

// Extract empty state to a separate component
function EmptyState() {
  return (
    <div className="bg-main-800 border border-main-700 rounded-lg p-8 text-center w-full">
      <p className="text-main-400">This folder is empty</p>
    </div>
  );
}
