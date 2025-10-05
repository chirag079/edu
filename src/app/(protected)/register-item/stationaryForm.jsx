"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { createListingRequest } from "@/actions/listing.actions.js";
import { uploadImage } from "@/actions/upload.actions.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import AIDescriptionWriter from "@/components/AIDescriptionWriter";

export default function StationaryForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mrp: "",
    price: "",
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("Please upload an image for the stationary item.");
      return;
    }
    if (
      !formData.title ||
      !formData.description ||
      !formData.mrp ||
      !formData.price
    ) {
      setError("Please fill in all required text fields.");
      return;
    }
    if (isNaN(parseFloat(formData.mrp)) || isNaN(parseFloat(formData.price))) {
      setError("MRP and Price must be valid numbers.");
      return;
    }
    if (parseFloat(formData.price) < 0 || parseFloat(formData.mrp) <= 0) {
      setError("MRP must be positive, and Price cannot be negative.");
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
      const listingData = {
        ...formData,
        itemType: "Stationary",
        mrp: parseFloat(formData.mrp),
        price: parseFloat(formData.price),
        imageUrl: uploadedImageUrl,
      };

      try {
        const result = await createListingRequest(listingData);
        if (result.success) {
          toast.success(result.message || "Stationary item submitted!");
          setFormData({
            title: "",
            description: "",
            mrp: "",
            price: "",
            imageUrl: "",
          });
          setImageFile(null);
          setImagePreview(null);
          setError("");
        } else {
          setError(result.message || "Listing submission failed.");
          toast.error(result.message || "Failed to submit listing.");
        }
      } catch (err) {
        setError("An unexpected error occurred during listing submission.");
        toast.error("An unexpected error occurred.");
      }
    });
  };

  const isSubmitting = isUploading || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload Input */}
      <div className="space-y-2">
        <Label htmlFor="image-stationary">Item Image (Required, &lt;1MB)</Label>
        <Input
          id="image-stationary"
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

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Item Name</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Scientific Calculator FX-991MS"
          required
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Condition, features, suitability, etc."
          required
          rows={4}
          disabled={isSubmitting}
          className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
        />
        <AIDescriptionWriter
          itemType="Stationary"
          title={formData.title}
          onDescriptionGenerated={(description) =>
            setFormData((prev) => ({ ...prev, description }))
          }
        />
      </div>

      {/* MRP & Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mrp">MRP (₹)</Label>
          <Input
            id="mrp"
            name="mrp"
            type="number"
            value={formData.mrp}
            onChange={handleChange}
            placeholder="Original price"
            required
            min="0.01"
            step="0.01"
            disabled={isSubmitting}
            className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Selling Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Your selling price"
            required
            min="0"
            step="0.01"
            disabled={isSubmitting}
            className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
          />
        </div>
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
          "Submit Stationary for Approval"
        )}
      </Button>
    </form>
  );
}
