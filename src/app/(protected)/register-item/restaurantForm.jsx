"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { createRestaurant } from "@/actions/listing.actions.js";
import { uploadImage } from "@/actions/upload.actions.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import AIDescriptionWriter from "@/components/AIDescriptionWriter";

export default function RestaurantForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    restaurantDetails: "", // Keep temporarily if needed, but redundant
    address: "",
    cuisine: "",
    imageUrl: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Image must be less than 1MB.");
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Invalid file type. Only JPG, PNG, WEBP, GIF allowed.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setError("");
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError(
        "Please upload an image (e.g., restaurant front, menu, deal poster)."
      );
      return;
    }
    if (
      !formData.name ||
      !formData.description ||
      !formData.address ||
      !formData.cuisine
    ) {
      setError(
        "Please fill in Restaurant Name, Description, Address, and Cuisine Types."
      );
      return;
    }

    setIsUploading(true);
    const imageFormData = new FormData();
    imageFormData.append("file", imageFile);
    let uploadedImageUrl = "";
    try {
      const uploadResult = await uploadImage(imageFormData);
      if (uploadResult.success && uploadResult.imageUrl) {
        uploadedImageUrl = uploadResult.imageUrl;
        toast.info("Image uploaded successfully.");
      } else {
        throw new Error(uploadResult.message || "Image upload failed.");
      }
    } catch (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }
    setIsUploading(false);

    startTransition(async () => {
      const restaurantData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        cuisine: formData.cuisine
          ? formData.cuisine.split(",").map((c) => c.trim())
          : [],
        images: [uploadedImageUrl],
      };

      try {
        const result = await createRestaurant(restaurantData);
        if (result.success) {
          toast.success(result.message || "Restaurant deal submitted!");
          setFormData({
            name: "",
            description: "",
            restaurantDetails: "",
            address: "",
            cuisine: "",
            imageUrl: "",
          });
          setImageFile(null);
          setImagePreview(null);
          setError("");
        } else {
          setError(result.message || "Restaurant submission failed.");
          toast.error(result.message || "Failed to submit restaurant.");
        }
      } catch (err) {
        setError("An unexpected error occurred during restaurant submission.");
        toast.error("An unexpected error occurred.");
      }
    });
  };

  const isSubmitting = isUploading || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload Input */}
      <div className="space-y-2">
        <Label htmlFor="image-restaurant">
          Restaurant/Deal Image (Required, &lt;1MB)
        </Label>
        <Input
          id="image-restaurant"
          name="image"
          type="file"
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={handleImageChange}
          required
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        {imagePreview && (
          <div className="relative w-full h-64 mt-4">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>

      {/* Restaurant Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Restaurant Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Cafe Delight"
          required
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
      </div>

      {/* Deal Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deal / Offer Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., 20% off on all pizzas, Happy Hour details..."
          required
          rows={3}
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
        <AIDescriptionWriter
          itemType="Restaurant"
          title={formData.name}
          onDescriptionGenerated={(description) =>
            setFormData((prev) => ({ ...prev, description }))
          }
        />
      </div>

      {/* TODO: Replace Restaurant Details Textarea with specific inputs */}
      {/* Example for Address: */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full address of the restaurant"
          required
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
      </div>
      {/* Example for Cuisine (comma-separated): */}
      <div className="space-y-2">
        <Label htmlFor="cuisine">Cuisine Types (comma-separated)</Label>
        <Input
          id="cuisine"
          name="cuisine"
          value={formData.cuisine}
          onChange={handleChange}
          placeholder="e.g., Italian, Chinese, Indian"
          required
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading Image...
          </>
        ) : isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Data...
          </>
        ) : (
          "Submit Restaurant Deal for Approval"
        )}
      </Button>
    </form>
  );
}
