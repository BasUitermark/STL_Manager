/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Link from "next/link";
import { ChevronRight, Home, Search } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbWithSearchProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  searchQuery?: string;
  onBackToSearch?: () => void;
}

export function BreadcrumbWithSearch({
  items,
  onNavigate,
  searchQuery,
  onBackToSearch,
}: BreadcrumbWithSearchProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const handleBackToSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackToSearch) {
      onBackToSearch();
    }
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4 overflow-x-auto py-1">
      {/* Back to search results button */}
      {searchQuery && onBackToSearch && (
        <>
          <button
            onClick={handleBackToSearch}
            className="flex items-center text-highlight-500 hover:text-highlight-400 font-medium"
          >
            <Search className="h-4 w-4 mr-1" />
            <span>Search results for "{searchQuery}"</span>
          </button>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
        </>
      )}

      {/* Regular breadcrumb items */}
      {items.map((item, index) => (
        <React.Fragment key={item.path || "home"}>
          {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />}

          <Link
            href={`/models?path=${encodeURIComponent(item.path)}`}
            onClick={(e) => handleClick(e, item.path)}
            className={`flex items-center hover:text-gray-900 dark:hover:text-gray-200 whitespace-nowrap ${
              index === items.length - 1 ? "font-medium text-gray-900 dark:text-white" : ""
            }`}
          >
            {index === 0 ? <Home className="h-4 w-4 mr-1" /> : null}
            <span>{item.name || "Home"}</span>
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
