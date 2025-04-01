// src/components/explorer/FileCard.tsx
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileIcon, FileBox, FileJson, FileText } from "lucide-react";
import { FileItem } from "@/types/file";
import { getPreviewUrl } from "@/lib/api/files";
import { formatFileSize } from "@/lib/utils/format";
import { BaseCard } from "./BaseCard";

interface FileCardProps {
  file: FileItem;
  onInfoClick?: () => void;
  onEditClick?: () => void;
}

export const FileCard = React.memo(function FileCard({
  file,
  onInfoClick,
  onEditClick,
}: FileCardProps) {
  const extension = file.extension.toLowerCase();
  const previewUrl = getPreviewUrl(file.path);

  // Derived data
  const { isImage, isStl, fileRoute } = useMemo(() => {
    // Check if the file is an image
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);

    // Check if file is an STL
    const isStl = extension === "stl";

    // Determine the route for the file
    const fileRoute = isStl
      ? `/viewer?path=${encodeURIComponent(file.path)}`
      : `/api/files/preview?path=${encodeURIComponent(file.path)}`;

    return { isImage, isStl, fileRoute };
  }, [file.path, extension]);

  // Helper function for file icon rendering
  const renderFileIcon = () => {
    if (isImage) {
      return (
        <Image
          src={previewUrl}
          alt={file.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      );
    }

    if (isStl) {
      return <FileBox className="h-24 w-24 text-purple-500" />;
    }

    if (["obj", "fbx", "gltf", "glb"].includes(extension)) {
      return <FileBox className="h-24 w-24 text-indigo-500" />;
    }

    if (["json", "xml"].includes(extension)) {
      return <FileJson className="h-24 w-24 text-amber-500" />;
    }

    if (["txt", "md", "pdf"].includes(extension)) {
      return <FileText className="h-24 w-24 text-blue-400" />;
    }

    return <FileIcon className="h-24 w-24 text-main-400" />;
  };

  return (
    <BaseCard onInfoClick={onInfoClick} onEditClick={onEditClick}>
      <Link href={fileRoute} className="block">
        <div className="aspect-square relative bg-main-700 flex items-center justify-center overflow-hidden">
          {renderFileIcon()}
        </div>

        <div className="p-3">
          <div className="flex items-start">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-white truncate">{file.name}</h3>
              <p className="text-xs text-main-400 mt-1">
                {formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-2 flex-shrink-0 uppercase text-xs font-medium rounded bg-main-700 px-2 py-1">
              {file.extension}
            </div>
          </div>
        </div>
      </Link>
    </BaseCard>
  );
});
