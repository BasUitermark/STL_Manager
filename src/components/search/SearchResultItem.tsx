import React from "react";
import { FileCard } from "@/components/explorer/FileCard";
import { FolderCard } from "@/components/explorer/FolderCard";
import { FileItem, FolderItem } from "@/types/file";

// Create a union type for search results
export type SearchResultItem = (FileItem | FolderItem) & {
  matchReason?: string;
};

interface SearchResultItemProps {
  item: SearchResultItem;
  navigateToFolder: (path: string) => void;
  onInfoClick?: (path: string) => void;
  onEditClick?: (path: string, name: string) => void;
}

export function SearchResultItem({
  item,
  navigateToFolder,
  onInfoClick,
  onEditClick,
}: SearchResultItemProps) {
  // Determine if this is a folder
  const isFolder = item.type === "folder";

  // Show breadcrumb information for the result
  const pathParts = item.path.split("/");
  const breadcrumbParts = pathParts.length > 1 ? pathParts.slice(0, -1) : [];

  const breadcrumb = breadcrumbParts.length > 0 && (
    <div className="mt-1 text-xs text-main-400 truncate">From: {breadcrumbParts.join(" > ")}</div>
  );

  // Render the appropriate card type
  if (isFolder) {
    // Type assertion to make TypeScript happy
    const folderItem = item as FolderItem;

    return (
      <div className="flex flex-col">
        <FolderCard
          folder={folderItem}
          onClick={navigateToFolder}
          onInfoClick={onInfoClick ? () => onInfoClick(item.path) : undefined}
          onEditClick={onEditClick ? () => onEditClick(item.path, item.name) : undefined}
        />
        {breadcrumb}
        {item.matchReason && (
          <div className="mt-1 text-xs text-main-500 truncate">{item.matchReason}</div>
        )}
      </div>
    );
  } else {
    // Type assertion to make TypeScript happy
    const fileItem = item as FileItem;

    return (
      <div className="flex flex-col">
        <FileCard
          file={fileItem}
          onInfoClick={onInfoClick ? () => onInfoClick(item.path) : undefined}
          onEditClick={onEditClick ? () => onEditClick(item.path, item.name) : undefined}
        />
        {breadcrumb}
        {item.matchReason && (
          <div className="mt-1 text-xs text-main-500 truncate">{item.matchReason}</div>
        )}
      </div>
    );
  }
}
