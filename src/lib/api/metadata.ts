// src/lib/api/metadata.ts
import {
  FileMetadata,
  MetadataInput,
  MetadataQueryOptions,
} from "@/components/metadata/metadata.types";

/**
 * Fetch metadata for a specific file
 */
export async function getFileMetadata(filePath: string): Promise<FileMetadata | null> {
  try {
    console.log("Fetching metadata for:", filePath);
    const response = await fetch(`/api/metadata/${encodeURIComponent(filePath)}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No metadata found for:", filePath);
        return null;
      }

      // For other errors, try to parse the error message
      const errorBody = await response.text();
      console.error(`Error ${response.status} fetching metadata:`, errorBody);
      return null;
    }

    // Make sure we have valid JSON before parsing
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for metadata fetch");
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing metadata JSON:", parseError);
      console.error("Response text was:", text);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch file metadata:", error);
    return null;
  }
}

/**
 * Save metadata for a file
 */
export async function saveFileMetadata(metadata: MetadataInput): Promise<FileMetadata | null> {
  try {
    console.log("Saving metadata for:", metadata.filePath);

    const response = await fetch("/api/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    // Check if response is HTML (indicates routing error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const htmlContent = await response.text();
      console.error("Received HTML response instead of JSON. API route might be misconfigured.");
      console.error("HTML preview:", htmlContent.substring(0, 200) + "...");
      throw new Error("API returned HTML instead of JSON. Route may be misconfigured.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to save metadata";

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse as JSON, use the text as is
        if (errorText) errorMessage = errorText;
      }

      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for metadata save");
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing saved metadata JSON:", parseError);
      console.error("Response text was:", text);
      return null;
    }
  } catch (error) {
    console.error("Error saving metadata:", error);
    throw error;
  }
}

/**
 * Update metadata for a specific file
 */
export async function updateFileMetadata(
  filePath: string,
  metadata: Omit<MetadataInput, "filePath">
): Promise<FileMetadata | null> {
  try {
    console.log("Updating metadata for:", filePath);

    const response = await fetch(`/api/metadata/${encodeURIComponent(filePath)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    // Check if response is HTML (indicates routing error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const htmlContent = await response.text();
      console.error("Received HTML response instead of JSON. API route might be misconfigured.");
      console.error("HTML preview:", htmlContent.substring(0, 200) + "...");
      throw new Error("API returned HTML instead of JSON. Route may be misconfigured.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to update metadata";

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse as JSON, use the text as is
        if (errorText) errorMessage = errorText;
      }

      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for metadata update");
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing updated metadata JSON:", parseError);
      console.error("Response text was:", text);
      return null;
    }
  } catch (error) {
    console.error("Error updating metadata:", error);
    throw error;
  }
}

/**
 * Query for metadata matching specific criteria
 */
export async function queryFileMetadata(
  options: MetadataQueryOptions = {}
): Promise<FileMetadata[]> {
  try {
    console.log("Querying metadata with options:", options);

    const params = new URLSearchParams();

    if (options.tags) {
      options.tags.forEach((tag) => params.append("tag", tag));
    }

    if (options.category) {
      params.append("category", options.category);
    }

    if (options.search) {
      params.append("search", options.search);
    }

    const response = await fetch(`/api/metadata?${params.toString()}`);

    // Check if response is HTML (indicates routing error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error("Received HTML response instead of JSON. API route might be misconfigured.");
      return [];
    }

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array for 404s
        return [];
      }

      console.error(`Error ${response.status} querying metadata`);
      return [];
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for metadata query");
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing queried metadata JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Failed to query metadata:", error);
    return [];
  }
}

/**
 * Get all available tags
 */
export async function getAllTags(): Promise<string[]> {
  try {
    console.log("Fetching all tags");

    const response = await fetch("/api/metadata?tags=all");

    // Check if response is HTML (indicates routing error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error("Received HTML response instead of JSON. API route might be misconfigured.");
      return [];
    }

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array for 404s
        return [];
      }

      console.error(`Error ${response.status} fetching tags`);
      return [];
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for tags fetch");
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing tags JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

/**
 * Get all available categories
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    console.log("Fetching all categories");

    const response = await fetch("/api/metadata?categories=all");

    // Check if response is HTML (indicates routing error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error("Received HTML response instead of JSON. API route might be misconfigured.");
      return [];
    }

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array for 404s
        return [];
      }

      console.error(`Error ${response.status} fetching categories`);
      return [];
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("Empty response for categories fetch");
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing categories JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
