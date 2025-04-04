// src/hooks/useFileSelection.ts
import { useState, useCallback } from "react";
import { FileSystemItem } from "@/types/file";

/**
 * Hook for managing file selection state
 * Used for batch operations on multiple files
 */
export function useFileSelection() {
  const [selectedItems, setSelectedItems] = useState<Record<string, FileSystemItem>>({});
  const [selectionMode, setSelectionMode] = useState<boolean>(false);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      // Clear selection when exiting selection mode
      setSelectedItems({});
    }
  }, [selectionMode]);

  const toggleItemSelection = useCallback((item: FileSystemItem) => {
    setSelectedItems((prev) => {
      const newSelection = { ...prev };
      if (newSelection[item.path]) {
        delete newSelection[item.path];
      } else {
        newSelection[item.path] = item;
      }
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems({});
  }, []);

  const selectAll = useCallback((items: FileSystemItem[]) => {
    const newSelection: Record<string, FileSystemItem> = {};
    items.forEach((item) => {
      newSelection[item.path] = item;
    });
    setSelectedItems(newSelection);
  }, []);

  const isSelected = useCallback(
    (path: string) => {
      return !!selectedItems[path];
    },
    [selectedItems]
  );

  const selectedCount = Object.keys(selectedItems).length;

  return {
    selectedItems,
    selectedItemsArray: Object.values(selectedItems),
    selectedCount,
    selectionMode,
    toggleSelectionMode,
    toggleItemSelection,
    clearSelection,
    selectAll,
    isSelected,
  };
}
