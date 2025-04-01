// src/components/viewer/StlViewer/StlViewer.tsx
"use client";

import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { useStlScene } from "./useStlScene";
import { StlViewerProps, StlViewerRef } from "./stlViewer.types";
import { Spinner } from "@/components/ui/spinner/Spinner";

/**
 * StlViewer component with cinematic view features
 *
 * Renders STL models with enhanced lighting, a build plate, and cinematic camera positioning.
 */
export const StlViewer = forwardRef<StlViewerRef, StlViewerProps>(
  (
    {
      stlUrl,
      width = "100%",
      height = "600px",
      backgroundColor = "#000000", // Default to black for cinematic view
      modelColor = "#6882AC", // Default to cinematic blue color
      wireframe = false,
      onModelLoaded,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Use the custom hook to manage the Three.js scene
    const { loading, error, resetCamera } = useStlScene({
      containerRef,
      backgroundColor,
      modelColor,
      wireframe,
      stlUrl,
      onModelLoaded,
    });

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      resetCamera,
    }));

    return (
      <div
        ref={containerRef}
        style={{
          width,
          height,
          position: "relative",
          backgroundColor: "#000000",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-main-900/80 backdrop-blur-sm">
            <div className="text-center">
              <Spinner className="h-12 w-12 mx-auto mb-4 text-highlight-500" />
              <p className="text-main-50 font-medium">Preparing model visualization...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
            <div className="text-center p-6 bg-main-800/90 rounded-lg max-w-md">
              <svg
                className="h-12 w-12 mx-auto mb-4 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-red-400 mb-2">Model Loading Error</h3>
              <p className="text-main-200">{error}</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 text-white/20 text-xs pointer-events-none">
          STL Cinematic View
        </div>
      </div>
    );
  }
);

StlViewer.displayName = "StlViewer";
