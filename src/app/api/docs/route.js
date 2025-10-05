import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'openapi.yaml');
    const swaggerDocument = fs.readFileSync(filePath, 'utf8');
    const doc = YAML.parse(swaggerDocument);
    return NextResponse.json(doc);
  } catch (error) {
    console.error("Failed to load OpenAPI spec:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}