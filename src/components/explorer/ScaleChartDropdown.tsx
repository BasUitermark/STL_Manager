// src/components/explorer/ScaleChartDropdown.tsx
import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Ruler } from "lucide-react";
import { getPreviewUrl } from "@/lib/api/files";

interface ScaleChartDropdownProps {
  scaleChartPath: string;
  folderName: string;
}

export function ScaleChartDropdown({ scaleChartPath, folderName }: ScaleChartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageUrl = getPreviewUrl(scaleChartPath);

  return (
    <div className="w-full mb-4 bg-main-800 border border-main-700 rounded-lg overflow-hidden">
      {/* Header/toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-main-800 hover:bg-main-700 transition-colors"
      >
        <div className="flex items-center text-main-50">
          <Ruler className="h-5 w-5 mr-2 text-highlight-500" />
          <span className="font-medium">Scale Chart for {folderName}</span>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-main-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-main-400" />
          )}
        </div>
      </button>

      {/* Content area */}
      {isOpen && (
        <div className=" border-t border-main-700 bg-main-900 transition-all">
          <div className="relative aspect-auto max-h-[70vh] overflow-auto">
            {/* Add a download link */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 px-3 py-1.5 bg-main-800/80 text-main-50 text-sm rounded-md hover:bg-main-700 backdrop-blur-sm z-10"
            >
              Open Full Size
            </a>

            {/* Image with responsive sizing */}
            <div className="relative w-full h-[60vh]" style={{ minHeight: "400px" }}>
              <Image
                src={imageUrl}
                alt={`Scale chart for ${folderName}`}
                className="object-contain"
                fill
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
