// src/components/common/VirtualizedGrid.tsx
import React, { useState, useEffect, useRef, ReactNode } from "react";

interface VirtualizedGridProps<T> {
  items: T[]; // Array of items to display
  renderItem: (item: T) => ReactNode; // Render function for each item
  getItemKey: (item: T) => string; // Function to get unique key for each item
  title?: string; // Optional title for the grid
  itemCount?: string; // Optional custom count display (e.g., "5 folders")
  itemsPerRow?: number; // Number of items per row
  threshold?: number; // Minimum items before virtualization is applied
  className?: string; // Additional class names for the grid
  itemType?: string; // Type of items (e.g., "files", "folders", "combined")
  showHeader?: boolean; // Whether to show the header with title/count
}

/**
 * A virtualized grid component that only renders visible items
 * Can be used for any type of item (files, folders, etc.)
 */
export function VirtualizedGrid<T>({
  items,
  renderItem,
  getItemKey,
  title,
  itemCount,
  itemsPerRow = 6, // Default to 6 items per row (xl breakpoint)
  threshold = 24, // Default threshold for virtualization
  className = "",
  showHeader = true,
}: VirtualizedGridProps<T>) {
  // Always initialize hooks to maintain hook order
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const [itemHeight, setItemHeight] = useState<number>(280); // Default height estimate
  const [containerHeight, setContainerHeight] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Skip virtualization for small lists
  const useVirtualization = items.length >= threshold;

  // Calculate total rows if using virtualization
  const totalRows = useVirtualization ? Math.ceil(items.length / itemsPerRow) : 0;

  // Update dimensions on resize
  useEffect(() => {
    // Only run virtualization effects if we're using virtualization
    if (!useVirtualization) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      // Update container height - adapt based on viewport
      const viewportHeight = window.innerHeight;
      setContainerHeight(Math.min(viewportHeight * 0.7, 800)); // Max 800px or 70% of viewport

      // Measure item height if an item exists
      const sampleItem = container.querySelector(".grid > div");
      if (sampleItem) {
        setItemHeight(sampleItem.clientHeight + 16); // Add gap (4 * 4px)
      }
    };

    // Initial measurement
    updateDimensions();

    // Listen for resize
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [useVirtualization]);

  // Update visible rows on scroll
  useEffect(() => {
    // Only run virtualization effects if we're using virtualization
    if (!useVirtualization) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const buffer = 1; // Extra rows to render above/below viewport

      // Calculate visible range
      const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const endRow = Math.min(
        totalRows - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
      );

      // Update visible rows
      const rows = [];
      for (let i = startRow; i <= endRow; i++) {
        rows.push(i);
      }
      setVisibleRows(rows);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Trigger initial calculation
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [itemHeight, containerHeight, totalRows, useVirtualization]);

  // If we have no items, return null
  if (items.length === 0) {
    return null;
  }

  // Generate the header text based on props
  const headerText = () => {
    if (title) {
      const countText = itemCount || (items.length > 0 ? `(${items.length})` : "");
      return `${title} ${countText}`;
    }
    return null;
  };

  // Title section with optional count
  const headerSection = showHeader && headerText() && (
    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{headerText()}</h2>
  );

  // Render regular grid for small lists
  if (!useVirtualization) {
    return (
      <div className={`w-full ${className}`}>
        {headerSection}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 w-full">
          {items.map((item) => (
            <div key={getItemKey(item)} className="h-full">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, use virtualized grid
  return (
    <div className={`w-full ${className}`}>
      {headerSection}

      <div
        ref={containerRef}
        className="overflow-y-auto w-full"
        style={{ maxHeight: `${containerHeight}px` }}
      >
        {/* Spacer div to maintain scroll size */}
        <div style={{ height: `${totalRows * itemHeight}px`, position: "relative" }}>
          {/* Only render visible rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 absolute top-0 left-0 w-full">
            {visibleRows.flatMap((row) => {
              // Calculate item indices for this row
              const startIdx = row * itemsPerRow;
              const endIdx = Math.min(startIdx + itemsPerRow, items.length);

              // Render items in this row
              return items.slice(startIdx, endIdx).map((item) => (
                <div
                  key={getItemKey(item)}
                  style={{ height: `${itemHeight - 16}px` }}
                  className="h-full"
                >
                  {renderItem(item)}
                </div>
              ));
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
