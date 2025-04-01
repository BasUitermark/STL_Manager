// src/hooks/useSearch.ts - Updated to fix folder navigation
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllTags } from "@/lib/api/metadata";
import type { SearchResultItem } from "@/components/search/SearchResultItem";

interface SearchState {
  query: string;
  tags: string[];
  fileType: string | null;
  isSearching: boolean;
  results: SearchResultItem[];
  isInSearchMode: boolean;
}

/**
 * Custom hook for managing search state and functionality
 */
export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNavigatingRef = useRef(false);

  // Parse search parameters from URL
  const urlQuery = searchParams.get("q") || "";
  const urlTags = searchParams.getAll("tag");
  const urlFileType = searchParams.get("type");

  // Determine if we're in search mode based on URL params
  const urlHasSearchParams = Boolean(urlQuery || urlTags.length > 0 || urlFileType);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: urlQuery,
    tags: urlTags,
    fileType: urlFileType,
    isSearching: false,
    results: [],
    isInSearchMode: urlHasSearchParams,
  });

  // Available tags for the tag selector
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load available tags for the tag selector
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Failed to load tags:", error);
      }
    };

    loadTags();
  }, []);

  // Perform search and update URL
  const performSearch = useCallback(
    async (query: string, tags: string[] = [], fileType: string | null = null) => {
      console.log("Performing search:", { query, tags, fileType });

      // Skip search if all parameters are empty
      const hasSearchParams = Boolean(query || tags.length > 0 || fileType);

      if (!hasSearchParams) {
        console.log("No search parameters, clearing search");
        setSearchState((prevState) => ({
          ...prevState,
          query: "",
          tags: [],
          fileType: null,
          results: [],
          isSearching: false,
          isInSearchMode: false,
        }));

        // Update URL - clear search params if not already at root
        if (searchParams.toString() !== "") {
          isNavigatingRef.current = true;
          router.push("/models");
        }
        return;
      }

      // Update search state
      setSearchState((prevState) => ({
        ...prevState,
        query,
        tags,
        fileType,
        isSearching: true,
        isInSearchMode: true,
      }));

      // Update URL with search parameters
      const params = new URLSearchParams();

      if (query) {
        params.set("q", query);
      }

      tags.forEach((tag) => {
        params.append("tag", tag);
      });

      if (fileType) {
        params.set("type", fileType);
      }

      // Create the search URL - keep on the models page but with search params
      const searchUrl = `/models?${params.toString()}`;

      // Update URL without causing a new navigation
      isNavigatingRef.current = true;
      router.push(searchUrl, { scroll: false });

      try {
        // Construct API search URL
        const apiParams = new URLSearchParams();
        if (query) apiParams.set("query", query);
        tags.forEach((tag) => apiParams.append("tag", tag));
        if (fileType) apiParams.set("fileType", fileType);

        console.log(`Fetching search results from /api/search?${apiParams.toString()}`);

        // Fetch search results from API
        const response = await fetch(`/api/search?${apiParams.toString()}`);

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const results = await response.json();
        console.log(`Received ${results.length} search results`);

        // Update state with results
        setSearchState((prevState) => ({
          ...prevState,
          results,
          isSearching: false,
          isInSearchMode: true, // Ensure we stay in search mode
        }));
      } catch (error) {
        console.error("Search error:", error);

        // Update state with error
        setSearchState((prevState) => ({
          ...prevState,
          results: [],
          isSearching: false,
          // Keep isInSearchMode true even on error, to show empty results state
          isInSearchMode: true,
        }));
      } finally {
        // Clear navigation flag after a delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      }
    },
    [router, searchParams]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    console.log("Clearing search");
    performSearch("", [], null);
  }, [performSearch]);

  // Handle folder navigation from search results
  const navigateToFolderFromSearch = useCallback(
    (folderPath: string) => {
      console.log("Navigating to folder from search:", folderPath);

      // First clear search mode
      setSearchState((prevState) => ({
        ...prevState,
        isInSearchMode: false,
      }));

      // Then navigate to the folder
      const params = new URLSearchParams();
      params.set("path", folderPath);

      // Mark that we're navigating to prevent URL listener from interfering
      isNavigatingRef.current = true;

      // Use a small delay to ensure state is updated first
      setTimeout(() => {
        router.push(`/models?${params.toString()}`);

        // Reset the navigation flag after a delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      }, 50);
    },
    [router]
  );

  // Initialize search from URL parameters on first load and when URL changes
  useEffect(() => {
    // Skip if we're in the middle of a navigation
    if (isNavigatingRef.current) {
      console.log("Skipping URL effect during navigation");
      return;
    }

    const currentQuery = searchParams.get("q") || "";
    const currentTags = searchParams.getAll("tag");
    const currentFileType = searchParams.get("type");
    const pathParam = searchParams.get("path");

    console.log("URL params updated:", {
      q: currentQuery,
      tags: currentTags,
      type: currentFileType,
      path: pathParam,
    });

    // If we have a path parameter, we're not in search mode
    if (pathParam) {
      console.log("Path parameter found, not in search mode");
      setSearchState((prevState) => ({
        ...prevState,
        isInSearchMode: false,
      }));
      return;
    }

    const urlHasSearchParams = Boolean(currentQuery || currentTags.length > 0 || currentFileType);

    // Check if URL params differ from current state or search mode doesn't match
    if (
      currentQuery !== searchState.query ||
      JSON.stringify(currentTags) !== JSON.stringify(searchState.tags) ||
      currentFileType !== searchState.fileType ||
      urlHasSearchParams !== searchState.isInSearchMode
    ) {
      console.log("URL params don't match state, updating...");
      // If URL has params, perform search with them
      if (urlHasSearchParams) {
        performSearch(currentQuery, currentTags, currentFileType);
      } else if (searchState.isInSearchMode) {
        // If URL has no params but we're in search mode, clear search
        clearSearch();
      }
    }
  }, [
    searchParams,
    searchState.query,
    searchState.tags,
    searchState.fileType,
    searchState.isInSearchMode,
    performSearch,
    clearSearch,
  ]);

  return {
    ...searchState,
    availableTags,
    performSearch,
    clearSearch,
    navigateToFolderFromSearch,
  };
}
