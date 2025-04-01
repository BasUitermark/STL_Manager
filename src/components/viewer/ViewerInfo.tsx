// src/components/viewer/ViewerInfo/ViewerInfo.tsx
"use client";

import React from "react";
import { Info, CalendarDays, HardDrive } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils/format";

export interface ViewerInfoProps {
  fileName: string;
  fileSize: number;
  modified: string;
  triangleCount?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

export function ViewerInfo({
  fileName,
  fileSize,
  modified,
  triangleCount,
  dimensions,
}: ViewerInfoProps) {
  return (
    <div className="bg-main-800 rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <Info className="h-5 w-5 text-highlight-500 mr-2" />
        <h3 className="text-lg font-medium text-main-50">Model Information</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-main-200">File Name</h4>
          <p className="text-sm text-main-50 mt-1">{fileName}</p>
        </div>

        <div className="flex justify-between">
          <div>
            <h4 className="text-sm font-medium text-main-200">
              <HardDrive className="h-4 w-4 inline mr-1" />
              File Size
            </h4>
            <p className="text-sm text-main-50 mt-1">{formatFileSize(fileSize)}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-main-200">
              <CalendarDays className="h-4 w-4 inline mr-1" />
              Modified
            </h4>
            <p className="text-sm text-main-50 mt-1">{formatDate(modified)}</p>
          </div>
        </div>

        {triangleCount !== undefined && (
          <div>
            <h4 className="text-sm font-medium text-main-200">Triangle Count</h4>
            <p className="text-sm text-main-50 mt-1">{triangleCount.toLocaleString()} triangles</p>
          </div>
        )}

        {dimensions && (
          <div>
            <h4 className="text-sm font-medium text-main-200">Dimensions</h4>
            <p className="text-sm text-main-50 mt-1">
              {dimensions.width.toFixed(2)} × {dimensions.height.toFixed(2)} ×{" "}
              {dimensions.depth.toFixed(2)} mm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
