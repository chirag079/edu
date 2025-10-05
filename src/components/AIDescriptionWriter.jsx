import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIDescriptionWriter({
  itemType,
  title,
  onDescriptionGenerated,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description");
      }

      if (!data.description) {
        throw new Error("No description generated");
      }

      onDescriptionGenerated(data.description);
      toast.success("AI description generated successfully!");
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error(
        error.message ||
          "Failed to generate description. Please try again or write your own."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={generateDescription}
        disabled={isGenerating || !title}
        className="w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Description
          </>
        )}
      </Button>
      {!title && (
        <p className="text-sm text-gray-500">
          Please enter a title first to generate a description
        </p>
      )}
    </div>
  );
}
