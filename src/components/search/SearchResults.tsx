/* eslint-disable react/no-unescaped-entities */
import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  navigateToFolder: (path: string) => void;
  onFileInfoClick?: (path: string) => void;
  onFolderInfoClick?: (path: string) => void;
  onFileEditClick?: (path: string, name: string) => void;
  onFolderEditClick?: (path: string, name: string) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}

export function SearchResults({
  results,
  query,
  navigateToFolder,
  onFileInfoClick,
  onFolderInfoClick,
  onFileEditClick,
  onFolderEditClick,
  onClearSearch,
  isLoading,
}: SearchResultsProps) {
  // Separate folder and file results for display
  const { folderResults, fileResults } = useMemo(() => {
    const folders = results.filter((item) => item.type === "folder");
    const files = results.filter((item) => item.type === "file");
    return { folderResults: folders, fileResults: files };
  }, [results]);

  // Handle info and edit clicks
  const handleInfoClick = (path: string) => {
    const item = results.find((r) => r.path === path);
    if (!item) return;

    if (item.type === "folder") {
      // It's a folder
      onFolderInfoClick?.(path);
    } else {
      // It's a file
      onFileInfoClick?.(path);
    }
  };

  const handleEditClick = (path: string, name: string) => {
    const item = results.find((r) => r.path === path);
    if (!item) return;

    if (item.type === "folder") {
      // It's a folder
      onFolderEditClick?.(path, name);
    } else {
      // It's a file
      onFileEditClick?.(path, name);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 my-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-highlight-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-main-300">Searching...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no results
  if (results.length === 0 && query) {
    return (
      <div className="bg-main-800 border border-main-700 rounded-lg p-8 text-center my-6">
        <p className="text-main-400 mb-2">No results found for "{query}"</p>
        <button
          onClick={onClearSearch}
          className="mt-4 px-3 py-2 text-sm bg-main-700 text-main-300 rounded hover:bg-main-600 hover:text-main-100 flex items-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </button>
      </div>
    );
  }

  // If we have no query and no results, don't show anything
  if (results.length === 0 && !query) {
    return null;
  }

  // Show search results
  return (
    <div className="my-6 w-full">
      <div className="flex justify-between items-center bg-main-800 border border-main-700 rounded-lg p-3 mb-4">
        <div>
          <h2 className="text-main-100 font-medium">
            {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
          </h2>
        </div>
        <button
          onClick={onClearSearch}
          className="px-3 py-1 text-sm bg-main-700 text-main-300 rounded hover:bg-main-600 hover:text-main-100 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Explorer
        </button>
      </div>

      <div className="w-full space-y-8">
        {/* Folder Results */}
        {folderResults.length > 0 && (
          <div className="w-full">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Folders {folderResults.length > 0 && `(${folderResults.length})`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {folderResults.map((item) => (
                <div key={item.path} className="h-full">
                  <SearchResultItem
                    item={item}
                    navigateToFolder={navigateToFolder}
                    onInfoClick={handleInfoClick}
                    onEditClick={handleEditClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Results */}
        {fileResults.length > 0 && (
          <div className="w-full">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Files {fileResults.length > 0 && `(${fileResults.length})`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {fileResults.map((item) => (
                <div key={item.path} className="h-full">
                  <SearchResultItem
                    item={item}
                    navigateToFolder={navigateToFolder}
                    onInfoClick={handleInfoClick}
                    onEditClick={handleEditClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
