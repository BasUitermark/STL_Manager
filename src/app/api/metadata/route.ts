// src/app/api/metadata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveMetadata, queryMetadata, getAllTags, getAllFileTypes } from "@/lib/metadata/metadata";
import { MetadataInput } from "@/components/metadata/metadata.types";

/**
 * GET /api/metadata
 * Retrieves metadata based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/metadata - Retrieving metadata query");
    const searchParams = req.nextUrl.searchParams;

    // Check if we're requesting all tags
    if (searchParams.get("tags") === "all") {
      console.log("Fetching all tags");
      const tags = await getAllTags();
      return NextResponse.json(tags);
    }

    // Check if we're requesting all categories
    if (searchParams.get("categories") === "all") {
      console.log("Fetching all categories");
      const categories = await getAllFileTypes();
      return NextResponse.json(categories);
    }

    // Otherwise, query metadata based on search params
    const options = {
      tags: searchParams.getAll("tag"),
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
    };

    console.log("Querying metadata with options:", options);
    const metadata = await queryMetadata(options);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error retrieving metadata:", error);
    return NextResponse.json({ error: "Failed to retrieve metadata" }, { status: 500 });
  }
}

/**
 * POST /api/metadata
 * Creates or updates metadata for a file
 */
export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/metadata - Saving metadata");
    const body = await req.json();
    console.log("Received metadata body:", body);

    // Validate the input
    if (!body.filePath || !body.fileName) {
      console.error("Missing required fields: filePath or fileName");
      return NextResponse.json({ error: "File path and name are required" }, { status: 400 });
    }

    // Ensure tags is an array
    if (!Array.isArray(body.tags)) {
      body.tags = [];
    }

    const input: MetadataInput = {
      filePath: body.filePath,
      fileName: body.fileName,
      tags: body.tags || [],
      fileType: body.category,
      description: body.description,
      resin: body.resin,
      layerHeight: body.layerHeight,
      supportsNeeded: body.supportsNeeded,
      notes: body.notes,
    };

    console.log("Saving metadata for:", input.filePath);
    const metadata = await saveMetadata(input);
    console.log("Metadata saved successfully");
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error saving metadata:", error);
    return NextResponse.json(
      {
        error:
          "Failed to save metadata: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
