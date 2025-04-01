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

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filePath = searchParams.get("path") || "";
  const stlUrl = getStlUrl(filePath);

  // Get the folder path to go back to
  const folderPath = filePath.split("/").slice(0, -1).join("/");
  const fileName = path.basename(filePath);

  // Viewer state
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("#1a1e21");
  const [modelColor, setModelColor] = useState<string>("#f3ca3c");
  const [fileInfo, setFileInfo] = useState<FileItem | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);

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

  // Function to handle model loaded event - use useCallback to prevent recreation
  const handleModelLoaded = useCallback((stats: ModelStats | null) => {
    setModelStats(stats);
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
      router.push(`/models?path=${encodeURIComponent(folderPath)}`);
    },
    [router, folderPath]
  );

  return (
    <div className="min-h-screen bg-main-950">
      <header className="bg-main-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href={`/models?path=${encodeURIComponent(folderPath)}`}
                onClick={handleBackClick}
                className="mr-4 p-2 rounded-full text-main-700 hover:bg-main-100 dark:text-main-300 dark:hover:bg-main-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <h1 className="text-xl font-bold text-main-900 dark:text-white">{fileName}</h1>
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

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-main-800 rounded-lg shadow overflow-hidden">
              <StlViewer
                key={stlUrl} /* Add a key to ensure proper remounting */
                stlUrl={stlUrl}
                height="1000px"
                backgroundColor={backgroundColor}
                modelColor={modelColor}
                wireframe={wireframe}
                ref={viewerRef}
                onModelLoaded={handleModelLoaded}
              />
            </div>
          </div>

          <div className="space-y-6">
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

            {fileInfo && (
              <ViewerInfo
                fileName={fileInfo.name}
                fileSize={fileInfo.size}
                modified={fileInfo.modified}
                triangleCount={modelStats?.triangleCount}
                dimensions={modelStats?.dimensions}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
