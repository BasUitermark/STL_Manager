// src/components/explorer/BaseCard.tsx
import React from "react";
import { Info, Edit, Check } from "lucide-react";

interface BaseCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  onInfoClick?: () => void;
  onEditClick?: () => void;
  className?: string;
  // New selection-related props
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: () => void;
}

export const BaseCard = React.memo(function BaseCard({
  children,
  onClick,
  onInfoClick,
  onEditClick,
  className = "",
  selectionMode = false,
  isSelected = false,
  onSelectionToggle,
}: BaseCardProps) {
  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onInfoClick) {
      onInfoClick();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditClick) {
      onEditClick();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectionMode && onSelectionToggle) {
      onSelectionToggle();
    } else if (onClick) {
      onClick();
    }
  };

  const baseClass = `bg-main-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden
    ${isSelected ? "border-2 border-highlight-500" : "border border-main-700"}`;

  return (
    <div className="relative group">
      <div
        className={`${baseClass} ${onClick || selectionMode ? "cursor-pointer" : ""} ${className}`}
        onClick={handleClick}
      >
        {/* Selection indicator */}
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div
              className={`w-5 h-5 rounded-md ${
                isSelected ? "bg-highlight-500" : "bg-main-700 border border-main-600"
              } flex items-center justify-center`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}

        {children}
      </div>

      {/* Action Buttons - Show on hover, hide in selection mode */}
      {!selectionMode && (onInfoClick || onEditClick) && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          {onInfoClick && (
            <button
              onClick={handleInfoClick}
              className="p-1.5 rounded-full bg-main-800/80 text-main-300 hover:bg-main-700 hover:text-main-50"
              title="View metadata"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
          {onEditClick && (
            <button
              onClick={handleEditClick}
              className="p-1.5 rounded-full bg-main-800/80 text-main-300 hover:bg-main-700 hover:text-main-50"
              title="Edit metadata"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});
