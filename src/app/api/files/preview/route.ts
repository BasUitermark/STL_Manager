// src/app/api/files/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { resolvePath } from "@/lib/utils/path";

// Define the root directory for files
const ROOT_DIR = process.env.STL_ROOT_DIR || path.join(process.cwd(), "public/models");

export async function GET(request: NextRequest) {
  try {
    // Get the file path from the query parameter
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    // Full path to the requested file
    const fullPath = resolvePath(ROOT_DIR, filePath);

    // Check if the file exists
    try {
      await fs.access(fullPath);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);

    // Determine content type based on file extension
    const extension = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream"; // Default content type

    switch (extension) {
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".stl":
        contentType = "application/sla";
        break;
      case ".txt":
        contentType = "text/plain";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".json":
        contentType = "application/json";
        break;
      // Add more content types as needed
    }

    // Return the file content
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
