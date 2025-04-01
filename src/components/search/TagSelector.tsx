import React, { useState } from "react";
import { Tag as TagIcon, Search, X } from "lucide-react";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ availableTags, selectedTags, onChange }: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter tags based on search query
  const filteredTags = searchQuery
    ? availableTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableTags;

  // Toggle a tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag if not selected
      onChange([...selectedTags, tag]);
    }
  };

  // Ensure we don't show selected tags in the available list
  const availableFilteredTags = filteredTags.filter((tag) => !selectedTags.includes(tag));

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs rounded bg-highlight-600 text-white"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
              <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-highlight-200">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-3 w-3 text-main-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tags..."
          className="w-full pl-6 p-1 text-sm bg-main-700/50 text-main-100 border border-main-600 rounded-md focus:ring-1 focus:ring-highlight-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Tags grid */}
      <div className="bg-main-700/30 rounded-md border border-main-600 p-2 max-h-48 overflow-y-auto">
        {availableFilteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableFilteredTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-main-700 text-main-300 hover:bg-main-600 hover:text-main-100"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-main-400 text-xs">
            {searchQuery ? "No matching tags found" : "No tags available"}
          </div>
        )}
      </div>

      {/* Selected tags count */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-main-400 flex justify-between">
          <span>
            {selectedTags.length} {selectedTags.length === 1 ? "tag" : "tags"} selected
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-highlight-400 hover:text-highlight-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
