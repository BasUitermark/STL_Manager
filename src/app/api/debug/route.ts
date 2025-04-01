// src/app/api/debug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getDb } from "@/lib/metadata/database";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing database connection...");

    // Initialize the database
    await initDatabase();

    // Get the database connection
    const db = await getDb();

    // Test a simple query
    let tableCount = 0;
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
        name: string;
      }[];
      tableCount = tables.length;
      console.log(
        "Database tables:",
        tables.map((t) => t.name)
      );
    } catch (queryError) {
      console.error("Error querying tables:", queryError);
      return NextResponse.json(
        {
          status: "error",
          message: "Database query failed",
          error: queryError instanceof Error ? queryError.message : String(queryError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      tableCount,
      path: process.cwd(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
