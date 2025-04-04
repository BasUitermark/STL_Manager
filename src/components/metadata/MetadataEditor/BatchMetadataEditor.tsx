// src/components/metadata/MetadataEditor/BatchMetadataEditor.tsx
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
import { Switch } from "@/components/ui/switch";
import { FileSystemItem } from "@/types/file";

interface BatchMetadataEditorProps {
  items: FileSystemItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function BatchMetadataEditor({ items, isOpen, onClose, onSaved }: BatchMetadataEditorProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "printSettings" | "notes">("basic");
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // State to track which fields to batch update
  const [updateFields, setUpdateFields] = useState({
    tags: false,
    category: false,
    description: false,
    resin: false,
    layerHeight: false,
    supportsNeeded: false,
    notes: false,
    printSettings: false,
  });

  // Use a template for metadata but don't load real data
  const {
    metadata,
    availableTags,
    availableCategories,
    handleInputChange,
    handleTagsChange,
    handlePrintSettingsChange,
  } = useMetadataForm({
    filePath: "",
    fileName: `${items.length} items selected`,
    skipLoad: true, // Skip loading real data
  });

  // Toggle whether a field should be updated
  const toggleField = (field: keyof typeof updateFields) => {
    setUpdateFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save metadata to all selected items
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setProgress(0);

      // Only collect fields that should be updated
      const updates: Partial<FileMetadata> = {};
      if (updateFields.tags) updates.tags = metadata.tags;
      if (updateFields.category) updates.category = metadata.category;
      if (updateFields.description) updates.description = metadata.description;
      if (updateFields.resin) updates.resin = metadata.resin;
      if (updateFields.layerHeight) updates.layerHeight = metadata.layerHeight;
      if (updateFields.supportsNeeded) updates.supportsNeeded = metadata.supportsNeeded;
      if (updateFields.notes) updates.notes = metadata.notes;
      if (updateFields.printSettings) updates.printSettings = metadata.printSettings;

      // Process items sequentially to avoid overwhelming the server
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Skip folders if needed
        // if (item.type === "folder" && !confirm("Apply these changes to folder metadata too?")) {
        //   continue;
        // }

        await saveFileMetadata({
          filePath: item.path,
          fileName: item.name,
          ...updates,
        });

        // Update progress
        setProgress(((i + 1) / items.length) * 100);
      }

      if (onSaved) {
        onSaved();
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
            Batch Edit: {items.length} items selected
          </h2>
          <button
            className="p-1 rounded-full text-main-400 hover:bg-main-700 hover:text-main-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <EditorTabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Field selection checkboxes */}
          <div className="mb-6 border-b border-main-700 pb-4">
            <h3 className="text-sm font-medium text-main-300 mb-3">Fields to update:</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Tags</span>
                <Switch checked={updateFields.tags} onCheckedChange={() => toggleField("tags")} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Category</span>
                <Switch
                  checked={updateFields.category}
                  onCheckedChange={() => toggleField("category")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Description</span>
                <Switch
                  checked={updateFields.description}
                  onCheckedChange={() => toggleField("description")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Resin</span>
                <Switch checked={updateFields.resin} onCheckedChange={() => toggleField("resin")} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Layer Height</span>
                <Switch
                  checked={updateFields.layerHeight}
                  onCheckedChange={() => toggleField("layerHeight")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Supports Needed</span>
                <Switch
                  checked={updateFields.supportsNeeded}
                  onCheckedChange={() => toggleField("supportsNeeded")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Notes</span>
                <Switch checked={updateFields.notes} onCheckedChange={() => toggleField("notes")} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-main-200">Print Settings</span>
                <Switch
                  checked={updateFields.printSettings}
                  onCheckedChange={() => toggleField("printSettings")}
                />
              </div>
            </div>
          </div>

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <BasicInfoForm
              fileName={`${items.length} items selected`}
              tags={metadata.tags}
              category={metadata.category}
              description={metadata.description || ""}
              onTagsChange={handleTagsChange}
              onInputChange={handleInputChange}
              availableTags={availableTags}
              availableCategories={availableCategories}
              disabled={!updateFields.tags && !updateFields.category && !updateFields.description}
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
              disabled={
                !updateFields.resin &&
                !updateFields.layerHeight &&
                !updateFields.supportsNeeded &&
                !updateFields.printSettings
              }
            />
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <NotesForm
              notes={metadata.notes || ""}
              onChange={(value) => handleInputChange("notes", value)}
              disabled={!updateFields.notes}
            />
          )}

          {/* Error message */}
          {saveError && <div className="mt-4 text-red-400 text-sm">{saveError}</div>}

          {/* Progress bar during save */}
          {saving && (
            <div className="mt-4">
              <div className="w-full bg-main-700 rounded-full h-2.5">
                <div
                  className="bg-highlight-500 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-main-400 mt-1">Processing {Math.round(progress)}%...</p>
            </div>
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
            disabled={saving || Object.values(updateFields).every((v) => !v)}
          >
            {saving ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
