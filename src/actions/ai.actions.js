export async function generateDescription(itemType, title) {
  try {
    const response = await fetch("/api/generate-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemType, title }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate description");
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
}
