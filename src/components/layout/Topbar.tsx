// src/components/layout/Topbar.tsx
import React, { ReactNode } from "react";
import { ArrowUp, RefreshCw, CheckSquare } from "lucide-react";

interface TopbarProps {
  currentPath: string;
  breadcrumbs: ReactNode; // Changed to accept ReactNode for custom breadcrumbs
  loading: boolean;
  onNavigateUp: () => void;
  onRefresh: () => void;
  // New selection-related props
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;
}

export function Topbar({
  currentPath,
  breadcrumbs,
  loading,
  onNavigateUp,
  onRefresh,
  selectionMode = false,
  onToggleSelectionMode,
}: TopbarProps) {
  return (
    <div className="bg-main-800 border-b border-main-700 py-4 w-full">
      <div className="px-6 flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-main-50">STL File Manager</h1>

        <div className="flex items-center space-x-2">
          {/* Selection mode toggle */}
          {onToggleSelectionMode && (
            <button
              onClick={onToggleSelectionMode}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                selectionMode
                  ? "bg-highlight-600 text-white"
                  : "bg-main-700 text-main-300 hover:bg-main-600 hover:text-main-100"
              }`}
            >
              <CheckSquare className="h-4 w-4 mr-1.5" />
              {selectionMode ? "Exit Selection" : "Select Files"}
            </button>
          )}

          <button
            onClick={onNavigateUp}
            disabled={!currentPath || selectionMode}
            className={`p-2 rounded-full ${
              !currentPath || selectionMode
                ? "text-main-400 cursor-not-allowed"
                : "text-main-300 hover:bg-main-700"
            }`}
            aria-label="Go up"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <button
            onClick={onRefresh}
            disabled={selectionMode}
            className={`p-2 rounded-full ${
              selectionMode ? "text-main-400 cursor-not-allowed" : "text-main-300 hover:bg-main-700"
            }`}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-6">{breadcrumbs}</div>
    </div>
  );
}
