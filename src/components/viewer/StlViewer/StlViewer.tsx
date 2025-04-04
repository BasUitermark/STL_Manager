// src/components/viewer/StlViewer/StlViewer.tsx
"use client";

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { StlViewerProps, StlViewerRef } from "./stlViewer.types";
import { Spinner } from "@/components/ui/spinner/Spinner";
import { StlViewerManager } from "../ThreeJsManager";
import { ViewerControls } from "../ViewControls";

/**
 * StlViewer component using an isolated Three.js manager
 * This approach completely separates Three.js from React's lifecycle
 */
export const StlViewer = forwardRef<StlViewerRef, StlViewerProps>(
  (
    {
      stlUrl,
      width = "100%",
      height = "100%",
      backgroundColor = "#1a1e21",
      modelColor = "#6882AC",
      wireframe = false,
      onModelLoaded,
      className = "",
    },
    ref
  ) => {
    // Container ref
    const containerRef = useRef<HTMLDivElement>(null);

    // Viewer manager ref - persists across renders
    const managerRef = useRef<StlViewerManager | null>(null);

    // Component state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Camera view callbacks
    const handleResetView = useCallback(() => {
      if (managerRef.current) {
        managerRef.current.resetCameraView();
      }
    }, []);

    const handleFrontView = useCallback(() => {
      if (managerRef.current) {
        managerRef.current.setFrontView();
      }
    }, []);

    const handleTopView = useCallback(() => {
      if (managerRef.current) {
        managerRef.current.setTopView();
      }
    }, []);

    const handleSideView = useCallback(() => {
      if (managerRef.current) {
        managerRef.current.setSideView();
      }
    }, []);

    // Initialize the viewer manager - only once on mount
    useEffect(() => {
      // Skip if no container
      if (!containerRef.current) return;

      console.log("Initializing StlViewerManager");

      // Create manager if it doesn't exist
      if (!managerRef.current) {
        managerRef.current = new StlViewerManager();
      }

      // Set up callbacks
      managerRef.current.onLoading(setLoading);
      managerRef.current.onError((message) => setError(message));
      managerRef.current.onModelLoaded((stats) => {
        if (onModelLoaded) {
          onModelLoaded(stats);
        }
        setModelLoaded(true);
      });

      // Initialize the manager with the container
      const manager = managerRef.current;
      const container = containerRef.current;

      manager.initialize(container, {
        backgroundColor,
        modelColor,
        wireframe,
      });

      // Load the model if URL is provided
      if (stlUrl) {
        manager.loadModel(stlUrl);
      } else {
        setLoading(false);
      }

      // Set up resize handler
      const handleResize = () => {
        if (manager) {
          manager.handleResize();
        }
      };

      window.addEventListener("resize", handleResize);

      // Cleanup function
      return () => {
        console.log("Cleaning up StlViewerManager");
        window.removeEventListener("resize", handleResize);

        if (managerRef.current) {
          managerRef.current.dispose();
          managerRef.current = null;
        }
      };
    }, [backgroundColor, modelColor, onModelLoaded, stlUrl, wireframe]); // Empty dependency array - only run once on mount

    // Handle prop changes
    useEffect(() => {
      if (!managerRef.current) return;

      console.log("Updating StlViewerManager config");

      // Update configuration
      managerRef.current.updateConfig({
        backgroundColor,
        modelColor,
        wireframe,
      });

      // Load new model if URL changed
      if (stlUrl) {
        managerRef.current.loadModel(stlUrl);
        setModelLoaded(false);
      }
    }, [backgroundColor, modelColor, wireframe, stlUrl]);

    // Ensure the wireframe prop change is properly detected and logged
    useEffect(() => {
      if (!managerRef.current) return;

      console.log("Updating viewer config. Wireframe:", wireframe);

      managerRef.current.updateConfig({
        backgroundColor,
        modelColor,
        wireframe,
      });

      // Force material update regardless of what's in the config
      if (managerRef.current.forceWireframeUpdate) {
        managerRef.current.forceWireframeUpdate(wireframe);
      }
    }, [backgroundColor, modelColor, wireframe, stlUrl]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => {
        return {
          resetCamera: handleResetView,
          setFrontView: handleFrontView,
          setTopView: handleTopView,
          setSideView: handleSideView,
        };
      },
      [handleResetView, handleFrontView, handleTopView, handleSideView]
    );

    return (
      <div
        ref={containerRef}
        style={{
          width,
          height,
          position: "relative",
          backgroundColor, // Fallback color while loading
          overflow: "hidden",
          borderRadius: "0.5rem",
        }}
        className={`border border-main-700 shadow-lg ${className}`}
        data-testid="stl-viewer"
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-main-900/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <Spinner className="h-12 w-12 mx-auto mb-4 text-highlight-500" />
              <p className="text-main-50 font-medium">Loading model...</p>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm z-10">
            <div className="text-center p-6 bg-main-800/90 rounded-lg max-w-md border border-red-800">
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
              <h3 className="text-lg font-medium text-red-400 mb-2">Viewer Error</h3>
              <p className="text-main-200">{error}</p>
            </div>
          </div>
        )}

        {/* Camera view controls - only show when model is loaded */}
        {modelLoaded && !loading && !error && (
          <ViewerControls
            onResetView={handleResetView}
            onFrontView={handleFrontView}
            onTopView={handleTopView}
            onSideView={handleSideView}
          />
        )}

        {/* Viewer info overlay */}
        <div className="absolute bottom-4 right-4 text-main-400 text-xs flex items-center gap-2 bg-main-800/60 px-3 py-1 rounded-full backdrop-blur-sm border border-main-700 z-10">
          <span>STL Viewer</span>
        </div>
      </div>
    );
  }
);

StlViewer.displayName = "StlViewer";
