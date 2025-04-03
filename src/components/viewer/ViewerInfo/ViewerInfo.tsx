// src/components/viewer/ViewerInfo/ViewerInfo.tsx
"use client";

import React from "react";
import { CalendarDays, HardDrive, Ruler } from "lucide-react";
import { ViewerInfoProps } from "./viewerInfo.types";
import { formatFileSize, formatDate } from "@/lib/utils/format";

/**
 * Component for displaying STL model information
 */
export function ViewerInfo({
  fileName,
  fileSize,
  modified,
  triangleCount,
  dimensions,
}: ViewerInfoProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-main-300">File Name</h4>
        <p className="text-sm text-main-50 mt-1 break-words">{fileName}</p>
      </div>

      <div className="flex justify-between">
        <div>
          <h4 className="text-sm font-medium text-main-300 flex items-center">
            <HardDrive className="h-4 w-4 mr-1" />
            File Size
          </h4>
          <p className="text-sm text-main-50 mt-1">{formatFileSize(fileSize)}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-main-300 flex items-center">
            <CalendarDays className="h-4 w-4 mr-1" />
            Modified
          </h4>
          <p className="text-sm text-main-50 mt-1">{formatDate(modified)}</p>
        </div>
      </div>

      {triangleCount !== undefined && (
        <div>
          <h4 className="text-sm font-medium text-main-300">Triangle Count</h4>
          <p className="text-sm text-main-50 mt-1">{triangleCount.toLocaleString()} triangles</p>
        </div>
      )}

      {dimensions && (
        <div>
          <h4 className="text-sm font-medium text-main-300 flex items-center">
            <Ruler className="h-4 w-4 mr-1" />
            Dimensions
          </h4>
          <p className="text-sm text-main-50 mt-1">
            {dimensions.width.toFixed(2)} × {dimensions.height.toFixed(2)} ×{" "}
            {dimensions.depth.toFixed(2)} mm
          </p>
        </div>
      )}
    </div>
  );
}
