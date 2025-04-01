// src/components/metadata/MetadataEditor/BasicInfoForm.tsx
import React, { useState, useEffect } from "react";
import { TagInput } from "../TagInput";
import { Plus } from "lucide-react";
import Select from "@/components/ui/select/Select";

interface BasicInfoFormProps {
  fileName: string;
  tags: string[];
  category?: string;
  description?: string;
  onTagsChange: (tags: string[]) => void;
  onInputChange: <T>(name: string, value: T) => void;
  availableTags: string[];
  availableCategories: string[];
}

export function BasicInfoForm({
  fileName,
  tags,
  category,
  description,
  onTagsChange,
  onInputChange,
  availableTags,
  availableCategories,
}: BasicInfoFormProps) {
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [localCategoryOptions, setLocalCategoryOptions] = useState<Array<any>>([]);

  // Setup category options for the select component
  useEffect(() => {
    // Create the options array including all available categories
    const options = [
      ...availableCategories.map((cat) => ({ value: cat, label: cat })),
      {
        value: "add-new",
        label: "Add New Category",
        icon: <Plus className="w-4 h-4 text-highlight-400" />,
      },
    ];

    // If we have a category that's not in the available list, add it
    if (category && !availableCategories.includes(category) && category !== "add-new") {
      options.unshift({
        value: category,
        label: category,
      });
    }

    setLocalCategoryOptions(options);
  }, [availableCategories, category]);

  // Handle when user wants to add a new category
  const handleAddNewCategory = () => {
    setIsAddingNewCategory(true);
    setNewCategoryValue(category && category !== "add-new" ? category : "");
  };

  // Handle saving the new category
  const handleSaveNewCategory = () => {
    if (newCategoryValue.trim()) {
      // Get the trimmed category value
      const newCategory = newCategoryValue.trim();

      // Set the category value using the callback
      onInputChange("category", newCategory);

      // Add to local options if not already there
      if (!availableCategories.includes(newCategory)) {
        setLocalCategoryOptions((prev) => [
          { value: newCategory, label: newCategory },
          ...prev.filter((option) => option.value !== "add-new"),
          {
            value: "add-new",
            label: "Add New Category",
            icon: <Plus className="w-4 h-4 text-highlight-400" />,
          },
        ]);
      }

      // Reset the UI state
      setIsAddingNewCategory(false);
      setNewCategoryValue("");
    }
  };

  // Handle pressing Enter in the new category input
  const handleNewCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveNewCategory();
    } else if (e.key === "Escape") {
      setIsAddingNewCategory(false);
      setNewCategoryValue("");
    }
  };

  // Handle canceling the new category input
  const handleCancelNewCategory = () => {
    setIsAddingNewCategory(false);
    setNewCategoryValue("");
  };

  return (
    <div className="space-y-4">
      {/* File Name (display only) */}
      <div>
        <label htmlFor="fileName" className="block text-sm font-medium text-main-300 mb-1">
          File Name
        </label>
        <input
          type="text"
          id="fileName"
          value={fileName}
          readOnly
          className="w-full p-2 bg-main-800/80 text-main-100 border border-main-700 rounded-md focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-main-300 mb-1">
          Tags
        </label>
        <TagInput value={tags} onChange={onTagsChange} suggestions={availableTags} />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-main-300 mb-1"></label>
        <div className="relative">
          {isAddingNewCategory ? (
            // Input field for new category
            <div className="flex">
              <input
                type="text"
                value={newCategoryValue}
                onChange={(e) => setNewCategoryValue(e.target.value)}
                onKeyDown={handleNewCategoryKeyDown}
                placeholder="Enter new category name"
                autoFocus
                className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <div className="flex">
                <button
                  onClick={handleSaveNewCategory}
                  className="px-4 py-2 bg-highlight-600 rounded-md text-white hover:bg-highlight-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelNewCategory}
                  className="px-4 py-2 bg-main-700 text-main-300 rounded-r-lg hover:bg-main-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Dropdown for selecting category
            <Select
              name="category"
              value={category}
              onValueChange={(val) => {
                if (val === "add-new") {
                  handleAddNewCategory();
                } else {
                  onInputChange("category", val);
                }
              }}
              theme="dark"
              fullWidth={true}
              options={localCategoryOptions}
              placeholder="Select category"
            />
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-main-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description || ""}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Enter a description for this model..."
          className="w-full p-3 bg-main-800/80 text-main-100 border border-main-700 rounded-lg focus:ring-2 focus:ring-highlight-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>
    </div>
  );
}
