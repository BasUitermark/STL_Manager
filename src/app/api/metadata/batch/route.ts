// src/app/api/metadata/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveMetadata } from "@/lib/metadata/metadata";
import { MetadataInput } from "@/components/metadata/metadata.types";

/**
 * POST /api/metadata/batch
 * Processes multiple metadata updates in a single request
 */
export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/metadata/batch - Processing batch metadata updates");
    const body = await req.json();

    if (!Array.isArray(body.items) || !body.updates) {
      return NextResponse.json({ error: "Invalid batch format" }, { status: 400 });
    }

    const { items, updates } = body;
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        // Each item needs a filePath and fileName at minimum
        if (!item.path || !item.name) {
          errorCount++;
          continue;
        }

        const metadata: MetadataInput = {
          filePath: item.path,
          fileName: item.name,
          // Merge with updates, preserving existing fields
          ...updates,
        };

        const result = await saveMetadata(metadata);
        results.push(result);
        successCount++;
      } catch (itemError) {
        console.error(`Error processing item ${item.path}:`, itemError);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalProcessed: items.length,
      successCount,
      errorCount,
      message: `Processed ${successCount} items successfully, ${errorCount} items failed`,
    });
  } catch (error) {
    console.error("Error in batch operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Batch operation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
