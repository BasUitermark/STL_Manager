// src/components/metadata/MetadataEditor/MetadataEditor.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { FileMetadata } from "@/components/metadata/metadata.types";
import { saveFileMetadata } from "@/lib/api/metadata";
import { Spinner } from "@/components/ui/spinner";
import { BasicInfoForm } from "./BasicInfoForm";
import { PrintSettingsForm } from "./PrintSettingsForm";
import { NotesForm } from "./NotesForm";
import { EditorTabBar } from "./EditorTabBar";
import { useMetadataForm } from "./useMetadataForm";

interface MetadataEditorProps {
  filePath: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (metadata: FileMetadata) => void;
}

export function MetadataEditor({
  filePath,
  fileName,
  isOpen,
  onClose,
  onSaved,
}: MetadataEditorProps) {
  const {
    metadata,
    loading,
    error,
    availableTags,
    availableCategories,
    handleInputChange,
    handleTagsChange,
    handlePrintSettingsChange,
  } = useMetadataForm({ filePath, fileName });

  const [activeTab, setActiveTab] = useState<"basic" | "printSettings" | "notes">("basic");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Save metadata
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const savedMetadata = await saveFileMetadata(metadata);

      if (onSaved && savedMetadata) {
        onSaved(savedMetadata);
      }

      onClose();
    } catch (err) {
      console.error("Error saving metadata:", err);
      setSaveError("Failed to save metadata");
    } finally {
      setSaving(false);
    }
  };

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-main-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-main-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-main-50">
            {metadata.fileName ? `Edit Metadata: ${metadata.fileName}` : "Add Metadata"}
          </h2>
          <button
            className="p-1 rounded-full text-main-400 hover:bg-main-700 hover:text-main-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8 text-highlight-500" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <EditorTabBar activeTab={activeTab} onChange={setActiveTab} />

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-grow">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <BasicInfoForm
                  fileName={metadata.fileName}
                  tags={metadata.tags}
                  category={metadata.category}
                  description={metadata.description || ""}
                  onTagsChange={handleTagsChange}
                  onInputChange={handleInputChange}
                  availableTags={availableTags}
                  availableCategories={availableCategories}
                />
              )}

              {/* Print Settings Tab */}
              {activeTab === "printSettings" && (
                <PrintSettingsForm
                  resin={metadata.resin || ""}
                  layerHeight={metadata.layerHeight}
                  supportsNeeded={metadata.supportsNeeded || false}
                  printSettings={metadata.printSettings}
                  onChange={handleInputChange}
                  onPrintSettingsChange={handlePrintSettingsChange}
                />
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <NotesForm
                  notes={metadata.notes || ""}
                  onChange={(value) => handleInputChange("notes", value)}
                />
              )}

              {/* Error message */}
              {(error || saveError) && (
                <div className="mt-4 text-red-400 text-sm">{error || saveError}</div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="px-4 py-3 border-t border-main-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-main-600 text-main-300 hover:bg-main-700 hover:text-main-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium rounded-md bg-highlight-600 text-white hover:bg-highlight-700 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Metadata"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
