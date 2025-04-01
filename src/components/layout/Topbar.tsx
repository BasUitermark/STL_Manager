// src/components/layout/Topbar.tsx
import React, { ReactNode } from "react";
import { ArrowUp, RefreshCw } from "lucide-react";

interface TopbarProps {
  currentPath: string;
  breadcrumbs: ReactNode; // Changed to accept ReactNode for custom breadcrumbs
  loading: boolean;
  onNavigateUp: () => void;
  onRefresh: () => void;
}

export function Topbar({
  currentPath,
  breadcrumbs,
  loading,
  onNavigateUp,
  onRefresh,
}: TopbarProps) {
  return (
    <div className="bg-main-800 border-b border-main-700 py-4 w-full">
      <div className="px-6 flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-main-50">STL File Manager</h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateUp}
            disabled={!currentPath}
            className={`p-2 rounded-full ${
              !currentPath ? "text-main-400 cursor-not-allowed" : "text-main-300 hover:bg-main-700"
            }`}
            aria-label="Go up"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-full text-main-300 hover:bg-main-700"
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
