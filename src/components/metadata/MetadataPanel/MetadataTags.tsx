// src/components/metadata/MetadataPanel/MetadataTags.tsx
import React from "react";
import { Tag } from "lucide-react";

interface MetadataTagsProps {
  tags: string[];
}

export function MetadataTags({ tags }: MetadataTagsProps) {
  return (
    <div className="py-3">
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 text-main-400 mr-2" />
        <h4 className="text-sm font-medium text-main-200">Tags</h4>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium rounded-md bg-highlight-900 text-highlight-300"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-sm text-main-400">No tags</span>
        )}
      </div>
    </div>
  );
}
