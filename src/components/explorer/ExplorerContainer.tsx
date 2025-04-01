// src/components/explorer/ExplorerContainer.tsx
import React from "react";
import { Explorer } from "./Explorer";
import { MetadataPanel } from "@/components/metadata/MetadataPanel";
import { FileSystemItem } from "@/types/file";

interface ExplorerContainerProps {
  items: FileSystemItem[];
  loading: boolean;
  error: string | null;
  currentPath: string;
  selectedItemPath: string | null;
  navigateToFolder: (path: string) => void;
  onFileInfoClick: (path: string) => void;
  onFolderInfoClick: (path: string) => void;
  onFileEditClick: (path: string, name: string) => void;
  onFolderEditClick: (path: string, name: string) => void;
}

export function ExplorerContainer({
  items,
  loading,
  error,
  selectedItemPath,
  navigateToFolder,
  onFileInfoClick,
  onFolderInfoClick,
  onFileEditClick,
  onFolderEditClick,
}: ExplorerContainerProps) {
  return (
    <div className="flex flex-1 py-6">
      {/* Content wrapper - flexible width with responsive padding */}
      <div className="flex flex-1 px-4 sm:px-6 w-full">
        {/* Main Content Area - takes full width unless sidebar is open */}
        <div className={`${selectedItemPath ? "w-full lg:w-3/4 pr-0 lg:pr-6" : "w-full"}`}>
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Explorer - full width without container class */}
          <Explorer
            items={items}
            loading={loading}
            navigateToFolder={navigateToFolder}
            onFileInfoClick={onFileInfoClick}
            onFolderInfoClick={onFolderInfoClick}
            onFileEditClick={onFileEditClick}
            onFolderEditClick={onFolderEditClick}
          />
        </div>

        {/* Metadata Sidebar - fixed width, hidden on mobile when visible */}
        {selectedItemPath && (
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0">
            <div className="bg-main-800 rounded-lg shadow-lg sticky top-6">
              <MetadataPanel
                filePath={selectedItemPath}
                isPinned={true}
                onEdit={() => {
                  const item = items.find((item) => item.path === selectedItemPath);
                  if (item) {
                    onFileEditClick(item.path, item.name);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
