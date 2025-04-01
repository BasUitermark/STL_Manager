// src/components/metadata/MetadataEditor/useMetadataForm.ts
import { useState, useEffect } from "react";
import { MetadataInput } from "../metadata.types";
import { getFileMetadata, getAllTags, getAllCategories } from "@/lib/api/metadata";

export interface UseMetadataFormProps {
  filePath: string;
  fileName: string;
}

export interface UseMetadataFormReturn {
  metadata: MetadataInput;
  loading: boolean;
  error: string | null;
  availableTags: string[];
  availableCategories: string[];
  handleInputChange: <T>(field: string, value: T) => void;
  handleTagsChange: (tags: string[]) => void;
  handlePrintSettingsChange: <T>(field: string, value: T) => void;
}

export function useMetadataForm({
  filePath,
  fileName,
}: UseMetadataFormProps): UseMetadataFormReturn {
  const [metadata, setMetadata] = useState<MetadataInput>({
    filePath,
    fileName,
    tags: [],
    category: undefined,
    description: "",
    resin: "",
    layerHeight: undefined,
    supportsNeeded: false,
    notes: "",
    printSettings: {},
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Fetch existing metadata if available
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Load existing metadata
        const existingMetadata = await getFileMetadata(filePath);
        if (existingMetadata) {
          setMetadata({
            filePath: existingMetadata.filePath,
            fileName: existingMetadata.fileName,
            tags: existingMetadata.tags,
            category: existingMetadata.category,
            description: existingMetadata.description || "",
            resin: existingMetadata.resin || "",
            layerHeight: existingMetadata.layerHeight,
            supportsNeeded: existingMetadata.supportsNeeded || false,
            notes: existingMetadata.notes || "",
            printSettings: existingMetadata.printSettings || {},
          });
        }

        // Load available tags and categories
        const [tags, categories] = await Promise.all([getAllTags(), getAllCategories()]);

        setAvailableTags(tags);
        setAvailableCategories(categories);
      } catch (err) {
        console.error("Error loading metadata:", err);
        setError("Failed to load metadata");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filePath]);

  // Generic input handler
  const handleInputChange = <T,>(field: string, value: T): void => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for tags update
  const handleTagsChange = (tags: string[]) => {
    setMetadata((prev) => ({
      ...prev,
      tags,
    }));
  };

  // Handler for print settings
  const handlePrintSettingsChange = <T,>(field: string, value: T): void => {
    setMetadata((prev) => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        [field]: value,
      },
    }));
  };

  return {
    metadata,
    loading,
    error,
    availableTags,
    availableCategories,
    handleInputChange,
    handleTagsChange,
    handlePrintSettingsChange,
  };
}
