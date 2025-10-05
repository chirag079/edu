import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import YAML from "yaml"; // Use 'yaml' instead of 'yamljs'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "openapi.yaml");
    const fileContent = fs.readFileSync(filePath, "utf8");
    const doc = YAML.parse(fileContent); // parse safely
    return NextResponse.json(doc);
  } catch (error) {
    console.error("Failed to load OpenAPI spec:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
