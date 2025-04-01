// src/app/api/files/info/route.ts
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
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file stats
    const stats = await fs.stat(fullPath);
    const extension = path.extname(filePath).toLowerCase().substring(1);

    // Return file information
    return NextResponse.json({
      name: path.basename(filePath),
      path: filePath,
      type: "file",
      extension,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error("Error getting file info:", error);
    return NextResponse.json({ error: "Failed to get file info" }, { status: 500 });
  }
}
