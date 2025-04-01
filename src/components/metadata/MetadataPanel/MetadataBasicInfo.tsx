// src/components/metadata/MetadataPanel/MetadataBasicInfo.tsx
import React from "react";
import { CalendarDays, FolderClosed } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { FileMetadata } from "../metadata.types";

interface MetadataBasicInfoProps {
  metadata: FileMetadata;
}

export function MetadataBasicInfo({ metadata }: MetadataBasicInfoProps) {
  return (
    <>
      {/* File Name */}
      <div className="py-3">
        <h4 className="text-sm font-medium text-main-200">Name</h4>
        <p className="text-sm text-main-50 mt-1">{metadata.fileName}</p>
      </div>

      {/* Category */}
      <div className="py-3">
        <div className="flex items-center mb-2">
          <FolderClosed className="h-4 w-4 text-main-400 mr-2" />
          <h4 className="text-sm font-medium text-main-200">Category</h4>
        </div>
        <p className="text-sm text-main-50 mt-1">
          {metadata.fileType || <span className="text-main-400">Uncategorized</span>}
        </p>
      </div>

      {/* Description */}
      {metadata.description && (
        <div className="py-3">
          <h4 className="text-sm font-medium text-main-200 mb-2">Description</h4>
          <p className="text-sm text-main-50 whitespace-pre-wrap">{metadata.description}</p>
        </div>
      )}

      {/* Dates */}
      <div className="py-3">
        <div className="flex items-center mb-2">
          <CalendarDays className="h-4 w-4 text-main-400 mr-2" />
          <h4 className="text-sm font-medium text-main-200">Dates</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-main-400">Added</p>
            <p className="text-sm text-main-50">{formatDate(metadata.dateAdded)}</p>
          </div>
          <div>
            <p className="text-xs text-main-400">Modified</p>
            <p className="text-sm text-main-50">{formatDate(metadata.lastModified)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
