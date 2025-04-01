// src/components/explorer/Breadcrumb.tsx
import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.path || "home"}>
          {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />}

          <Link
            href={`/models?path=${encodeURIComponent(item.path)}`}
            onClick={(e) => handleClick(e, item.path)}
            className={`flex items-center hover:text-gray-900 dark:hover:text-gray-200 ${
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
