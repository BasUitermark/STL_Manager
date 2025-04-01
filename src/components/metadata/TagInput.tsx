// src/components/metadata/TagInput/TagInput.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Add tags...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Add tag on Enter or comma
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      if (showSuggestions && filteredSuggestions.length > 0) {
        // If suggestions are shown, select the active suggestion
        addTag(filteredSuggestions[activeSuggestionIndex]);
      } else if (inputValue.trim()) {
        // Otherwise, add the current input value
        addTag(inputValue.trim());
      }
    }
    // Navigate through suggestions with arrow keys
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions) {
        setActiveSuggestionIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions) {
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      }
    }
    // Remove last tag on Backspace if input is empty
    else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  const addTag = (tag: string): void => {
    // Normalize tag (trim, remove commas)
    const normalizedTag = tag.trim().replace(/,/g, "");

    if (normalizedTag && !value.includes(normalizedTag)) {
      const newTags = [...value, normalizedTag];
      onChange(newTags);
      setInputValue("");
      setShowSuggestions(false);
    } else {
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string): void => {
    const newTags = value.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleSuggestionClick = (suggestion: string): void => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="min-h-12 w-full p-2 bg-main-800/80 text-main-100 border border-main-700 rounded-md focus-within:ring-2 focus-within:ring-highlight-500 focus-within:border-transparent flex flex-wrap gap-2 items-center transition-all duration-200">
        {/* Display existing tags */}
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-highlight-900 text-highlight-300 rounded-md px-2 py-1 text-xs font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-highlight-300 hover:text-highlight-100 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Input for new tags */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setShowSuggestions(filteredSuggestions.length > 0)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-grow min-w-[120px] bg-transparent border-0 p-0 focus:ring-0 text-sm outline-none"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-main-800 py-1 shadow-lg ring-1 ring-main-600"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`cursor-pointer px-4 py-3 text-sm transition-colors ${
                activeSuggestionIndex === index
                  ? "bg-highlight-800 text-highlight-100"
                  : "text-main-50 hover:bg-main-700"
              }`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
