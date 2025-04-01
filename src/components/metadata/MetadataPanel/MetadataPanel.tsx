// src/components/metadata/MetadataPanel/MetadataPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { getFileMetadata } from "@/lib/api/metadata";
import { Spinner } from "@/components/ui/spinner";
import { MetadataBasicInfo } from "./MetadataBasicInfo";
import { MetadataTags } from "./MetadataTags";
import { MetadataPrintSettings } from "./MetadataPrintSettings";
import { FileMetadata } from "../metadata.types";

interface MetadataPanelProps {
  filePath: string;
  isPinned: boolean;
  onEdit?: () => void;
}

export function MetadataPanel({ filePath, onEdit }: MetadataPanelProps) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetadata() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFileMetadata(filePath);
        setMetadata(data);
      } catch (err) {
        setError("Failed to load metadata");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (filePath) {
      loadMetadata();
    }
  }, [filePath]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-40">
        <Spinner className="h-8 w-8 text-highlight-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="p-4 text-main-400">
        <h3 className="text-lg font-medium text-main-50 mb-4">Item Details</h3>
        <p>No metadata available.</p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-4 px-4 py-2 bg-highlight-600 text-white rounded-md hover:bg-highlight-700 flex items-center"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Add Metadata
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 divide-y divide-main-700 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-lg font-medium text-main-50">Item Details</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 rounded-full text-main-300 hover:bg-main-700"
            aria-label="Edit metadata"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Basic Info */}
      <MetadataBasicInfo metadata={metadata} />

      {/* Tags */}
      <MetadataTags tags={metadata.tags} />

      {/* Print Settings */}
      <MetadataPrintSettings
        resin={metadata.resin}
        layerHeight={metadata.layerHeight}
        supportsNeeded={metadata.supportsNeeded}
        printSettings={metadata.printSettings}
      />

      {/* Notes (if they exist) */}
      {metadata.notes && (
        <div className="py-3">
          <h4 className="text-sm font-medium text-main-200 mb-2">Notes</h4>
          <p className="text-sm text-main-50 whitespace-pre-wrap">{metadata.notes}</p>
        </div>
      )}
    </div>
  );
}
