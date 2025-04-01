// src/components/viewer/ViewerSettings/ViewerSettings.tsx
"use client";

import React from "react";
import { Box, Grid3x3, Paintbrush2, RotateCcw, Download } from "lucide-react";

export interface ViewerSettingsProps {
  wireframe: boolean;
  setWireframe: (value: boolean) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  modelColor: string;
  setModelColor: (value: string) => void;
  resetCamera: () => void;
  downloadStl: () => void;
}

export function ViewerSettings({
  wireframe,
  setWireframe,
  backgroundColor,
  setBackgroundColor,
  modelColor,
  setModelColor,
  resetCamera,
  downloadStl,
}: ViewerSettingsProps) {
  return (
    <div className="bg-main-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-main-50 mb-4">Viewer Settings</h3>

      <div className="space-y-4">
        {/* Display Mode Settings */}
        <div>
          <label className="text-sm font-medium text-main-300">Display Mode</label>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => setWireframe(false)}
              className={`flex items-center px-3 py-2 rounded ${
                !wireframe
                  ? "bg-highlight-900 text-highlight-300"
                  : "text-main-300 hover:bg-main-700"
              }`}
              aria-pressed={!wireframe}
            >
              <Box className="h-4 w-4 mr-2" />
              <span>Solid</span>
            </button>

            <button
              onClick={() => setWireframe(true)}
              className={`flex items-center px-3 py-2 rounded ${
                wireframe
                  ? "bg-highlight-900 text-highlight-300"
                  : "text-main-300 hover:bg-main-700"
              }`}
              aria-pressed={wireframe}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              <span>Wireframe</span>
            </button>
          </div>
        </div>

        {/* Color Settings */}
        {/* <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-main-300" htmlFor="model-color">
              Model Color
            </label>
            <div className="mt-2 flex items-center">
              <Paintbrush2 className="h-4 w-4 mr-2 text-main-500" />
              <input
                id="model-color"
                type="color"
                value={modelColor}
                onChange={(e) => setModelColor(e.target.value)}
                className="h-8 w-16 border-0 p-0 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-main-300" htmlFor="background-color">
              Background
            </label>
            <div className="mt-2 flex items-center">
              <Paintbrush2 className="h-4 w-4 mr-2 text-main-500" />
              <input
                id="background-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-8 w-16 border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        </div> */}

        {/* Controls */}
        <div className="border-t border-main-700 pt-4">
          <div className="flex justify-between">
            <button
              onClick={resetCamera}
              className="flex items-center px-3 py-2 rounded text-main-300 hover:bg-main-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Reset View</span>
            </button>

            <button
              onClick={downloadStl}
              className="flex items-center px-3 py-2 rounded text-main-300 hover:bg-main-700"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
