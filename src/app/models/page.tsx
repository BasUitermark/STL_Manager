// src/app/models/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useFileExplorer } from "@/hooks/useFileExplorer";
import { Topbar } from "@/components/layout/Topbar";
import { ExplorerContainer } from "@/components/explorer/ExplorerContainer";
import { MetadataTopbar } from "@/components/metadata/MetadataPanel";
import { MetadataEditor } from "@/components/metadata/MetadataEditor";
import { getFileMetadata } from "@/lib/api/metadata";
import { FileMetadata } from "@/components/metadata/metadata.types";
import { SearchBar, SearchResults } from "@/components/search";
import { BreadcrumbWithSearch } from "@/components/explorer/BreadcrumbWithSearch";
import { useSearch } from "@/components/search/useSearch";

export default function ModelsPage() {
  // Use our custom hooks
  const {
    currentPath,
    items,
    loading,
    error,
    loadItems,
    navigateToFolder,
    navigateUp,
    breadcrumbs,
  } = useFileExplorer();

  const {
    query,
    tags,
    fileType,
    isSearching,
    results,
    isInSearchMode,
    availableTags,
    performSearch,
    clearSearch,
  } = useSearch();

  // State for current folder metadata
  const [folderMetadata, setFolderMetadata] = useState<FileMetadata | null>(null);
  const [loadingFolderMetadata, setLoadingFolderMetadata] = useState(false);

  // State for metadata sidebar
  const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);

  // State for metadata editor
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [editingItemPath, setEditingItemPath] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>("");

  // Load current folder metadata when path changes
  useEffect(() => {
    async function loadFolderMetadata() {
      if (!currentPath) return;

      setLoadingFolderMetadata(true);
      try {
        const data = await getFileMetadata(currentPath);
        setFolderMetadata(data);
      } catch (error) {
        console.error("Error loading folder metadata:", error);
        setFolderMetadata(null);
      } finally {
        setLoadingFolderMetadata(false);
      }
    }

    loadFolderMetadata();

    // Clear selected item when navigating to a new folder
    setSelectedItemPath(null);
  }, [currentPath]);

  // Event handlers
  const handleRefresh = () => {
    loadItems(currentPath);
  };

  const handleSearch = (newQuery: string, newTags: string[], newFileType: string | null) => {
    performSearch(newQuery, newTags, newFileType);
  };

  const handleFileInfoClick = (path: string) => {
    setSelectedItemPath((prev) => (prev === path ? null : path));
  };

  const handleFolderInfoClick = (path: string) => {
    setSelectedItemPath((prev) => (prev === path ? null : path));
  };

  const handleFileEditClick = (path: string, name: string) => {
    setEditingItemPath(path);
    setEditingItemName(name);
    setEditorOpen(true);
  };

  const handleCurrentFolderEditClick = () => {
    if (!currentPath) return;

    const folderName = currentPath.split("/").pop() || "Root";
    setEditingItemPath(currentPath);
    setEditingItemName(folderName);
    setEditorOpen(true);
  };

  const handleFolderEditClick = (path: string, name: string) => {
    setEditingItemPath(path);
    setEditingItemName(name);
    setEditorOpen(true);
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setEditingItemPath(null);
  };

  const handleMetadataSaved = () => {
    // Refresh the file list to show updated metadata
    loadItems(currentPath);

    // If we edited the current folder, reload its metadata
    if (editingItemPath === currentPath) {
      getFileMetadata(currentPath)
        .then((data) => {
          setFolderMetadata(data);
        })
        .catch((error) => {
          console.error("Error loading folder metadata:", error);
          setFolderMetadata(null);
        });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-main-950">
      {/* Fixed position top bars */}
      <div className="flex flex-col w-full">
        {/* Top Navigation Bar */}
        <Topbar
          currentPath={currentPath}
          breadcrumbs={
            <BreadcrumbWithSearch
              items={breadcrumbs}
              onNavigate={navigateToFolder}
              searchQuery={isInSearchMode ? query : undefined}
              onBackToSearch={isInSearchMode ? clearSearch : undefined}
            />
          }
          loading={loading || isSearching}
          onNavigateUp={navigateUp}
          onRefresh={handleRefresh}
        />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          availableTags={availableTags}
          isSearching={isSearching}
          initialQuery={query}
          initialTags={tags}
          initialFileType={fileType}
        />

        {/* Folder Metadata Bar - only show when not in search mode */}
        {!isInSearchMode && (
          <MetadataTopbar
            currentPath={currentPath}
            metadata={folderMetadata}
            isLoading={loadingFolderMetadata}
            onEditClick={handleCurrentFolderEditClick}
          />
        )}
      </div>

      {/* Main Content Area */}
      {isInSearchMode ? (
        // Search Results
        <div className="px-6">
          <SearchResults
            results={results}
            query={query}
            navigateToFolder={navigateToFolder}
            onFileInfoClick={handleFileInfoClick}
            onFolderInfoClick={handleFolderInfoClick}
            onFileEditClick={handleFileEditClick}
            onFolderEditClick={handleFolderEditClick}
            onClearSearch={clearSearch}
            isLoading={isSearching}
          />
        </div>
      ) : (
        // Regular Explorer
        <ExplorerContainer
          items={items}
          loading={loading}
          error={error}
          currentPath={currentPath}
          selectedItemPath={selectedItemPath}
          navigateToFolder={navigateToFolder}
          onFileInfoClick={handleFileInfoClick}
          onFolderInfoClick={handleFolderInfoClick}
          onFileEditClick={handleFileEditClick}
          onFolderEditClick={handleFolderEditClick}
        />
      )}

      {/* Metadata Editor Modal */}
      {editorOpen && editingItemPath && (
        <MetadataEditor
          filePath={editingItemPath}
          fileName={editingItemName}
          isOpen={editorOpen}
          onClose={handleEditorClose}
          onSaved={handleMetadataSaved}
        />
      )}
    </main>
  );
}
