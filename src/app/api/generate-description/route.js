import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemType, title } = await request.json();

    if (!itemType || !title) {
      return NextResponse.json(
        { error: "Item type and title are required" },
        { status: 400 }
      );
    }

    // Get the model - trying gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = generatePrompt(itemType, title);

    // Generate content with proper error handling
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const description = response.text();
      return NextResponse.json({ description });
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      // Adding more details from the potential apiError structure
      const details = apiError.message || "Unknown API error";
      const status = apiError.status || apiError.code || 500;
      return NextResponse.json(
        {
          error: "Failed to generate description",
          details: details,
          status: status,
        },
        { status: status }
      );
    }
  } catch (error) {
    console.error("Error in generate-description route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

function generatePrompt(itemType, title) {
  switch (itemType.toLowerCase()) {
    case "stationary":
      return `Write a brief, engaging description for a stationary item titled "${title}" that would be useful for college students. Focus on its utility, quality, and condition. Keep it under 100 words.`;
    case "flat":
      return `Write a brief, appealing description for a student accommodation titled "${title}". Include key features that would interest college students, such as location, amenities, and living conditions. Keep it under 100 words.`;
    case "event":
      return `Write a brief, exciting description for a college event titled "${title}". Highlight what makes it special and why students should attend. Keep it under 100 words.`;
    case "restaurant":
      return `Write a brief, enticing description for a restaurant titled "${title}" that would appeal to college students. Focus on the cuisine, ambiance, and any student-friendly features. Keep it under 100 words.`;
    default:
      return `Write a brief, informative description for an item titled "${title}" that would be relevant to college students. Keep it under 100 words.`;
  }
}
