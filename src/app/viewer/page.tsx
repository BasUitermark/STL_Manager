// src/app/viewer/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  StlViewer,
  StlViewerRef,
  ViewerSettings,
  ViewerInfo,
  ModelStats,
} from "@/components/viewer";
import { getStlUrl } from "@/lib/api/files";
import { FileItem } from "@/types/file";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import path from "path";

// Function to extract file information from path and metadata
async function getFileInfo(filePath: string): Promise<FileItem | null> {
  try {
    const response = await fetch(`/api/files/info?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error("Failed to fetch file info");
    return await response.json();
  } catch (error) {
    console.error("Error fetching file info:", error);
    return null;
  }
}

/**
 * Helper function to ensure consistent URL encoding between pages
 * This is crucial for back navigation to work properly
 * @param path The path to encode
 */
function encodePathForUrl(path: string): string {
  // Use encodeURIComponent instead of custom replacements
  return encodeURIComponent(path);
}

/**
 * Page component for viewing STL files
 */
export default function ViewerPage() {
  // Get URL parameters
  const searchParams = useSearchParams();
  const router = useRouter();
  const filePath = searchParams.get("path") || "";
  const stlUrl = getStlUrl(filePath);

  // Generate a unique instance ID for this page render
  // This ensures the StlViewer fully remounts when paths change
  const [viewerInstanceId] = useState(() => `viewer-${Math.random().toString(36).substring(2, 9)}`);

  // Get the folder path to go back to
  const folderPath = filePath.split("/").slice(0, -1).join("/");
  const fileName = path.basename(filePath);

  // Store the original, correctly encoded back path
  const encodedBackPath = useRef(encodePathForUrl(folderPath));

  // Viewer state
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("#1a1e21");
  const [modelColor, setModelColor] = useState<string>("#6882AC");
  const [fileInfo, setFileInfo] = useState<FileItem | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);

  // Reference to the StlViewer component
  const viewerRef = useRef<StlViewerRef>(null);

  // Load file information once
  useEffect(() => {
    let isMounted = true;

    if (filePath) {
      getFileInfo(filePath).then((info) => {
        if (isMounted && info) {
          setFileInfo(info);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  // Handle model loaded event
  const handleModelLoaded = useCallback((stats: ModelStats | null) => {
    if (stats) {
      setModelStats(stats);
    }
  }, []);

  // Function to reset camera to default position
  const resetCamera = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.resetCamera();
    }
  }, []);

  // Function to download the STL file
  const downloadStl = useCallback(() => {
    if (fileInfo) {
      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = stlUrl;
      a.download = fileInfo.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [fileInfo, stlUrl]);

  // Function to navigate back to the folder
  const handleBackClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Add a flag to ensure explorer hooks synchronize correctly
      const params = new URLSearchParams();
      params.set("path", folderPath); // Use raw path
      params.set("source", "viewer"); // Add source param to help hooks coordinate

      router.push(`/models?${params.toString()}`);
    },
    [router, folderPath]
  );

  return (
    <div className="min-h-screen bg-main-950 flex flex-col">
      <header className="bg-main-800 shadow">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href={`/models?path=${encodedBackPath.current}`}
                onClick={handleBackClick}
                className="mr-4 p-2 rounded-full text-main-300 hover:bg-main-700"
                aria-label="Back to folder"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <h1 className="text-xl font-bold text-white">{fileName}</h1>
            </div>

            <button
              className="flex items-center px-4 py-2 bg-highlight-600 text-white rounded-md hover:bg-highlight-700"
              onClick={downloadStl}
            >
              <Save className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-9rem)]">
          <div className="lg:col-span-3 h-full">
            <Card className="h-full flex flex-col">
              <div className="flex-1">
                {/* 
                  Key with viewerInstanceId ensures complete remount
                  when switching between models
                */}
                <StlViewer
                  key={viewerInstanceId}
                  stlUrl={stlUrl}
                  height="100%"
                  backgroundColor={backgroundColor}
                  modelColor={modelColor}
                  wireframe={wireframe}
                  ref={viewerRef}
                  onModelLoaded={handleModelLoaded}
                  className="h-full"
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-main-50">Viewer Settings</h2>
              </CardHeader>
              <CardContent>
                <ViewerSettings
                  wireframe={wireframe}
                  setWireframe={setWireframe}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                  modelColor={modelColor}
                  setModelColor={setModelColor}
                  resetCamera={resetCamera}
                  downloadStl={downloadStl}
                />
              </CardContent>
            </Card>

            {fileInfo && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-main-50">Model Information</h2>
                </CardHeader>
                <CardContent>
                  <ViewerInfo
                    fileName={fileInfo.name}
                    fileSize={fileInfo.size}
                    modified={fileInfo.modified}
                    triangleCount={modelStats?.triangleCount}
                    dimensions={modelStats?.dimensions}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
