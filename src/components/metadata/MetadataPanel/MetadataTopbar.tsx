// src/components/metadata/MetadataTopbar.tsx
import React from "react";
import { Edit } from "lucide-react";
import { FileMetadata } from "../metadata.types";

interface MetadataTopbarProps {
  currentPath: string;
  metadata: FileMetadata | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export function MetadataTopbar({
  currentPath,
  metadata,
  isLoading,
  onEditClick,
}: MetadataTopbarProps) {
  if (!currentPath) return null;

  return (
    <div className="bg-main-800 border-b border-main-700 py-3 w-full">
      <div className="px-6 flex justify-between items-center">
        {/* Tags and Category display */}
        <div className="flex-1">
          {isLoading ? (
            <p className="text-sm text-main-400">Loading metadata...</p>
          ) : metadata ? (
            <div className="flex flex-wrap gap-2">
              {metadata.tags && metadata.tags.length > 0 ? (
                metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-highlight-900 text-highlight-300"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-main-400">No tags</p>
              )}
              {metadata.category && (
                <span className="ml-2 text-sm text-main-300">Category: {metadata.category}</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-main-400">No metadata - click edit to add</p>
          )}
        </div>

        {/* Edit button placed at the far right */}
        <button
          onClick={onEditClick}
          className="p-1.5 rounded-full text-main-300 hover:bg-main-700 hover:text-main-50 ml-4"
          title="Edit folder metadata"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
