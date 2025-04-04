// src/components/explorer/ExplorerContainer.tsx
import React, { useMemo, useState } from "react";
import { Explorer } from "./Explorer";
import { MetadataPanel } from "@/components/metadata/MetadataPanel";
import { FileSystemItem } from "@/types/file";
import { BatchMetadataEditor } from "@/components/metadata/MetadataEditor/BatchMetadataEditor";
import { ScaleChartDropdown } from "./ScaleChartDropdown";
import { findScaleChart } from "@/lib/utils/findScaleChart";

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
  loadItems?: (path: string) => void;
  // New selection-related props
  selectionMode?: boolean;
  selectedItems?: Record<string, FileSystemItem>;
  onToggleSelectionMode?: () => void;
  onToggleSelection?: (item: FileSystemItem) => void;
  onSelectAll?: (items: FileSystemItem[]) => void;
  onClearSelection?: () => void;
  isSelected?: (path: string) => boolean;
}

export function ExplorerContainer({
  items,
  loading,
  error,
  currentPath,
  selectedItemPath,
  navigateToFolder,
  onFileInfoClick,
  onFolderInfoClick,
  onFileEditClick,
  onFolderEditClick,
  loadItems,
  // Selection props
  selectionMode = false,
  selectedItems = {},
  onToggleSelectionMode,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  isSelected = () => false,
}: ExplorerContainerProps) {
  // State for batch edit modal
  const [batchEditModalOpen, setBatchEditModalOpen] = useState<boolean>(false);

  const scaleChartPath = useMemo(() => {
    if (loading || items.length === 0) return null;
    return findScaleChart(items);
  }, [items, loading]);

  const folderName = useMemo(() => {
    if (!currentPath) return "Root";
    const parts = currentPath.split("/");
    return parts[parts.length - 1];
  }, [currentPath]);

  return (
    <div className="flex flex-1 py-6">
      {/* Content wrapper - flexible width with responsive padding */}
      <div className="flex flex-1 px-4 sm:px-6 w-full">
        {/* Main Content Area - takes full width unless sidebar is open */}
        <div className={`${selectedItemPath ? "w-full lg:w-3/4 pr-0 lg:pr-6" : "w-full"}`}>
          {/* Selection toolbar - only visible in selection mode */}
          {selectionMode && (
            <div className="mb-4 p-4 bg-main-800 rounded-lg border border-main-700 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-main-200 mr-4">
                  {Object.keys(selectedItems).length} items selected
                </span>
                <button
                  onClick={() => onSelectAll?.(items)}
                  className="px-3 py-1.5 text-sm bg-main-700 text-main-300 hover:bg-main-600 hover:text-main-100 rounded-md mr-2"
                >
                  Select All
                </button>
                <button
                  onClick={onClearSelection}
                  className="px-3 py-1.5 text-sm bg-main-700 text-main-300 hover:bg-main-600 hover:text-main-100 rounded-md"
                >
                  Clear Selection
                </button>
              </div>
              <div>
                <button
                  onClick={() => setBatchEditModalOpen(true)}
                  className="px-4 py-2 bg-highlight-600 text-white rounded-md hover:bg-highlight-700 disabled:opacity-50"
                  disabled={Object.keys(selectedItems).length === 0}
                >
                  Edit Selected
                </button>
                <button
                  onClick={onToggleSelectionMode}
                  className="ml-3 px-3 py-1.5 text-sm bg-main-700 text-main-300 hover:bg-main-600 hover:text-main-100 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scale Chart Dropdown - render only if a scale chart is found */}
          {scaleChartPath && !selectionMode && (
            <ScaleChartDropdown scaleChartPath={scaleChartPath} folderName={folderName} />
          )}

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
            selectionMode={selectionMode}
            selectedItems={selectedItems}
            onToggleSelection={onToggleSelection}
            isSelected={isSelected}
          />
        </div>

        {/* Metadata Sidebar - fixed width, hidden on mobile when visible */}
        {selectedItemPath && !selectionMode && (
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

      {/* Batch edit modal */}
      <BatchMetadataEditor
        items={Object.values(selectedItems)}
        isOpen={batchEditModalOpen}
        onClose={() => setBatchEditModalOpen(false)}
        onSaved={() => {
          onClearSelection?.();
          onToggleSelectionMode?.();
          // Refresh the current folder
          if (loadItems) loadItems(currentPath);
        }}
      />
    </div>
  );
}
