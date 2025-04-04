// src/app/models/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useFileExplorer } from "@/hooks/useFileExplorer";
import { useFileSelection } from "@/hooks/useFileSelection";
import { Topbar } from "@/components/layout/Topbar";
import { ExplorerContainer } from "@/components/explorer/ExplorerContainer";
import { MetadataTopbar } from "@/components/metadata/MetadataPanel";
import { MetadataEditor } from "@/components/metadata/MetadataEditor";
import { BatchMetadataEditor } from "@/components/metadata/MetadataEditor/BatchMetadataEditor";
import { getFileMetadata } from "@/lib/api/metadata";
import { FileMetadata } from "@/components/metadata/metadata.types";
import { SearchBar, SearchResults } from "@/components/search";
import { BreadcrumbWithSearch } from "@/components/explorer/BreadcrumbWithSearch";
import { useSearch } from "@/components/search/useSearch";
import { Edit } from "lucide-react";

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
    selectedItems,
    selectedItemsArray,
    selectedCount,
    selectionMode,
    toggleSelectionMode,
    toggleItemSelection,
    clearSelection,
    selectAll,
    isSelected,
  } = useFileSelection();

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

  // State for batch edit modal
  const [batchEditModalOpen, setBatchEditModalOpen] = useState<boolean>(false);

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
        {/* Top Navigation Bar with selection toggle */}
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
          selectionMode={selectionMode}
          onToggleSelectionMode={toggleSelectionMode}
        />

        {/* Search Bar - only show when not in selection mode */}
        {!selectionMode && (
          <SearchBar
            onSearch={handleSearch}
            availableTags={availableTags}
            isSearching={isSearching}
            initialQuery={query}
            initialTags={tags}
            initialFileType={fileType}
          />
        )}

        {/* Folder Metadata Bar - only show when not in search mode and not in selection mode */}
        {!isInSearchMode && !selectionMode && (
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
        // Search Results with selection support
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
            selectionMode={selectionMode}
            selectedItems={selectedItems}
            onToggleSelection={toggleItemSelection}
            isSelected={isSelected}
          />
        </div>
      ) : (
        // Regular Explorer with selection support
        <ExplorerContainer
          items={items}
          loading={loading}
          error={error}
          currentPath={currentPath}
          selectedItemPath={selectionMode ? null : selectedItemPath}
          navigateToFolder={navigateToFolder}
          onFileInfoClick={handleFileInfoClick}
          onFolderInfoClick={handleFolderInfoClick}
          onFileEditClick={handleFileEditClick}
          onFolderEditClick={handleFolderEditClick}
          loadItems={loadItems}
          selectionMode={selectionMode}
          selectedItems={selectedItems}
          onToggleSelectionMode={toggleSelectionMode}
          onToggleSelection={toggleItemSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          isSelected={isSelected}
        />
      )}

      {/* Batch edit floating button - only show when in selection mode with items selected */}
      {selectionMode && selectedCount > 0 && (
        <button
          className="fixed bottom-6 right-6 px-4 py-3 bg-highlight-600 text-white rounded-lg shadow-lg hover:bg-highlight-700 flex items-center"
          onClick={() => setBatchEditModalOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit {selectedCount} selected items
        </button>
      )}

      {/* Batch Edit Modal */}
      <BatchMetadataEditor
        items={selectedItemsArray}
        isOpen={batchEditModalOpen}
        onClose={() => setBatchEditModalOpen(false)}
        onSaved={() => {
          clearSelection();
          toggleSelectionMode();
          loadItems(currentPath);
        }}
      />

      {/* Metadata Editor Modal (for single item editing) */}
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
