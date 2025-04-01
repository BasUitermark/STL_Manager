import React, { useState, useEffect } from "react";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { TagSelector } from "./TagSelector";
import { FileTypes } from "@/lib/metadata/fileTypes";

interface SearchBarProps {
  onSearch: (query: string, tags: string[], fileType: string | null) => void;
  availableTags: string[];
  isSearching: boolean;
  initialQuery?: string;
  initialTags?: string[];
  initialFileType?: string | null;
}

export function SearchBar({
  onSearch,
  availableTags,
  isSearching,
  initialQuery = "",
  initialTags = [],
  initialFileType = null,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(initialFileType);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setQuery(initialQuery);
    setSelectedTags(initialTags);
    setSelectedFileType(initialFileType);
  }, [initialQuery, initialTags, initialFileType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting search:", { query, selectedTags, selectedFileType });
    onSearch(query, selectedTags, selectedFileType);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedTags([]);
    setSelectedFileType(null);
    onSearch("", [], null);
  };

  // Handle keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-main-800 border-b border-main-700 px-6 py-3 transition-all duration-200">
      <form onSubmit={handleSubmit}>
        {/* Basic Search Row */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-main-400" />
            </div>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 p-2 bg-main-700/50 text-main-100 border border-main-600 rounded-md focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
              <span className="text-xs text-main-400">Press / to focus</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 text-sm text-main-300 hover:text-main-100 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showAdvanced ? "Hide Filters" : "Filters"}
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </button>

          <button
            type="submit"
            className="px-3 py-2 bg-highlight-600 text-white rounded-md hover:bg-highlight-700 flex items-center"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </button>

          {(query || selectedTags.length > 0 || selectedFileType) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-main-400 hover:text-main-100 rounded-full"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* File Type Select */}
              <div>
                <label htmlFor="fileType" className="block text-xs font-medium text-main-400 mb-1">
                  File Type
                </label>
                <select
                  id="fileType"
                  value={selectedFileType || ""}
                  onChange={(e) => setSelectedFileType(e.target.value || null)}
                  className="w-full p-2 bg-main-700/50 text-main-100 border border-main-600 rounded-md focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none"
                >
                  <option value="">All Types</option>
                  <option value={FileTypes.PUBLISHER}>Publishers</option>
                  <option value={FileTypes.COLLECTION}>Collections</option>
                  <option value={FileTypes.MODEL}>Models</option>
                  <option value={FileTypes.VARIANT}>Variants</option>
                  <option value={FileTypes.STL}>STL Files</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-main-400 mb-1">Tags</label>
                <TagSelector
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>
            </div>

            {/* Advanced Print Settings would go here */}

            {/* Reset Filters */}
            {(selectedFileType || selectedTags.length > 0) && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedFileType(null);
                  }}
                  className="px-3 py-1 text-xs text-main-300 hover:text-main-100"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
