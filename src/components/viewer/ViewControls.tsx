// src/components/viewer/ViewerControls.tsx
"use client";

import React from "react";
import {
  Box,
  AlignVerticalJustifyStart,
  AlignHorizontalJustifyStart,
  RotateCcw,
} from "lucide-react";

interface ViewerControlsProps {
  onResetView: () => void;
  onFrontView: () => void;
  onTopView: () => void;
  onSideView: () => void;
}

/**
 * Camera view control panel that appears in the viewer
 */
export function ViewerControls({
  onResetView,
  onFrontView,
  onTopView,
  onSideView,
}: ViewerControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex gap-1 bg-main-800/60 px-2 py-1 rounded-full backdrop-blur-sm border border-main-700 z-10">
      <button
        onClick={onFrontView}
        title="Front View"
        className="p-1.5 hover:bg-main-700 rounded-full transition-colors"
        type="button"
      >
        <AlignVerticalJustifyStart className="w-4 h-4 text-main-300" />
      </button>

      <button
        onClick={onTopView}
        title="Top View"
        className="p-1.5 hover:bg-main-700 rounded-full transition-colors"
        type="button"
      >
        <AlignHorizontalJustifyStart className="w-4 h-4 text-main-300" />
      </button>

      <button
        onClick={onSideView}
        title="Side View"
        className="p-1.5 hover:bg-main-700 rounded-full transition-colors"
        type="button"
      >
        <Box className="w-4 h-4 text-main-300" />
      </button>

      <div className="h-4 mx-1 border-l border-main-600 self-center"></div>

      <button
        onClick={onResetView}
        title="Reset View"
        className="p-1.5 hover:bg-main-700 rounded-full transition-colors"
        type="button"
      >
        <RotateCcw className="w-4 h-4 text-main-300" />
      </button>
    </div>
  );
}
