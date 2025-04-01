// src/components/metadata/MetadataEditor/EditorTabBar.tsx
import React from "react";

type Tab = "basic" | "printSettings" | "notes";

interface EditorTabBarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function EditorTabBar({ activeTab, onChange }: EditorTabBarProps) {
  return (
    <div className="flex border-b border-main-700">
      <button
        className={`px-6 py-3 text-sm font-medium transition-colors ${
          activeTab === "basic"
            ? "text-highlight-500 border-b-2 border-highlight-500 bg-main-800"
            : "text-main-300 hover:text-main-100 hover:bg-main-800/50"
        }`}
        onClick={() => onChange("basic")}
      >
        Basic Info
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium transition-colors ${
          activeTab === "printSettings"
            ? "text-highlight-500 border-b-2 border-highlight-500 bg-main-800"
            : "text-main-300 hover:text-main-100 hover:bg-main-800/50"
        }`}
        onClick={() => onChange("printSettings")}
      >
        Print Settings
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium transition-colors ${
          activeTab === "notes"
            ? "text-highlight-500 border-b-2 border-highlight-500 bg-main-800"
            : "text-main-300 hover:text-main-100 hover:bg-main-800/50"
        }`}
        onClick={() => onChange("notes")}
      >
        Notes
      </button>
    </div>
  );
}
