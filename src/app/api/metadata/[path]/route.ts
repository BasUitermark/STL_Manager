// src/app/api/metadata/[path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMetadataByPath, saveMetadata } from "@/lib/metadata/metadata";
import { MetadataInput } from "@/components/metadata/metadata.types";

/**
 * GET /api/metadata/[path]
 * Retrieves metadata for a specific file path
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string }> } // Params is a Promise
) {
  try {
    // Await the params Promise
    const { path: filePath } = await context.params;

    console.log(`GET /api/metadata/${filePath} - Fetching metadata`);

    const metadata = await getMetadataByPath(filePath);

    if (!metadata) {
      console.log(`No metadata found for: ${filePath}`);
      return NextResponse.json(
        null, // Return null instead of error for 404
        { status: 404 }
      );
    }

    console.log(`Metadata found for: ${filePath}`);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error retrieving metadata:", error);
    return NextResponse.json(
      {
        error:
          "Failed to retrieve metadata: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/metadata/[path]
 * Updates metadata for a specific file path
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string }> } // Params is a Promise
) {
  try {
    // Await the params Promise
    const { path: filePath } = await context.params;

    console.log(`PUT /api/metadata/${filePath} - Updating metadata`);

    const body = await req.json();
    console.log("Received update body:", body);

    // Ensure tags is an array
    if (!Array.isArray(body.tags)) {
      body.tags = [];
    }

    const input: MetadataInput = {
      filePath: filePath,
      fileName: body.fileName,
      tags: body.tags,
      fileType: body.category,
      description: body.description,
      resin: body.resin,
      layerHeight: body.layerHeight,
      supportsNeeded: body.supportsNeeded,
      notes: body.notes,
    };

    const metadata = await saveMetadata(input);
    console.log("Metadata updated successfully");
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      {
        error:
          "Failed to update metadata: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
