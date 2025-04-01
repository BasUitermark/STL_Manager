// src/components/explorer/FolderCard.tsx
import React, { useMemo } from "react";
import Image from "next/image";
import { Folder } from "lucide-react";
import { FolderItem } from "@/types/file";
import { getPreviewUrl } from "@/lib/api/files";
import { BaseCard } from "./BaseCard";

interface FolderCardProps {
  folder: FolderItem;
  onClick: (path: string) => void;
  onInfoClick?: () => void;
  onEditClick?: () => void;
}

export const FolderCard = React.memo(function FolderCard({
  folder,
  onClick,
  onInfoClick,
  onEditClick,
}: FolderCardProps) {
  // Handle folder click
  const handleClick = () => {
    onClick(folder.path);
  };

  // Determine if we have an image preview
  const isImagePreview = useMemo(() => {
    return (
      folder.previewPath &&
      [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
        folder.previewPath!.toLowerCase().endsWith(ext)
      )
    );
  }, [folder.previewPath]);

  // Get preview URL if we have a preview path
  const previewUrl = useMemo(() => {
    return folder.previewPath ? getPreviewUrl(folder.previewPath) : "";
  }, [folder.previewPath]);

  return (
    <BaseCard onClick={handleClick} onInfoClick={onInfoClick} onEditClick={onEditClick}>
      <div className="aspect-square relative bg-main-700 flex items-center justify-center overflow-hidden">
        {isImagePreview ? (
          <Image
            src={previewUrl}
            alt={folder.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Folder className="h-24 w-24 text-highlight-500" />
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-main-50 truncate">{folder.name}</h3>
            <p className="text-xs text-main-500 dark:text-main-400 mt-1">
              {folder.itemCount} {folder.itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <Folder className="h-5 w-5 text-highlight-500 flex-shrink-0" />
        </div>
      </div>
    </BaseCard>
  );
});
