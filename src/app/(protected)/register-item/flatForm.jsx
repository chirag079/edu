"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Plus } from "lucide-react";
import { toast } from "react-toastify";
import groot from "../../../../public/groot.jpg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createListingRequest } from "@/actions/listing.actions.js";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadImage } from "@/actions/upload.actions.js";
import AIDescriptionWriter from "@/components/AIDescriptionWriter";

export default function FlatForm() {
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
    rent: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
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
      setError("Please upload an image of the property.");
      return;
    }
    if (
      !formData.title ||
      !formData.description ||
      !formData.rent ||
      !formData.location ||
      !formData.bedrooms ||
      !formData.bathrooms
    ) {
      setError("Please fill in all required text fields.");
      return;
    }
    if (
      isNaN(parseFloat(formData.rent)) ||
      isNaN(parseInt(formData.bedrooms)) ||
      isNaN(parseInt(formData.bathrooms))
    ) {
      setError("Rent, Bedrooms, and Bathrooms must be valid numbers.");
      return;
    }
    if (
      parseFloat(formData.rent) <= 0 ||
      parseInt(formData.bedrooms) <= 0 ||
      parseInt(formData.bathrooms) <= 0
    ) {
      setError("Rent, Bedrooms, and Bathrooms must be positive numbers.");
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
        itemType: "Flat/PG",
        rent: parseFloat(formData.rent),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        imageUrl: uploadedImageUrl,
      };

      try {
        const result = await createListingRequest(listingData);
        if (result.success) {
          toast.success(result.message || "Flat/PG submitted!");
          setFormData({
            title: "",
            description: "",
            rent: "",
            location: "",
            bedrooms: "",
            bathrooms: "",
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
      <Card>
        <CardHeader>
          <CardTitle>Flats / P.G.</CardTitle>
          <div className="text-sm text-muted-foreground">
            {error?.length > 0 ? (
              <p className="text-destructive">{error}</p>
            ) : (
              "All fields are mandatory to fill."
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="image-flat">
              Property Image (Required, &lt;1MB)
            </Label>
            <Input
              id="image-flat"
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
          <div className="space-y-2">
            <Label htmlFor="title">Property Title / Name</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 2BHK near NSUT Gate 2"
              required
              disabled={isSubmitting}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Full address or nearby landmark"
              required
              disabled={isSubmitting}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Amenities, furnishing, rules, availability date, etc."
              required
              rows={4}
              disabled={isSubmitting}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
            <AIDescriptionWriter
              itemType="Flat"
              title={formData.title}
              onDescriptionGenerated={(description) =>
                setFormData((prev) => ({ ...prev, description }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Monthly Rent (₹)</Label>
              <Input
                id="rent"
                name="rent"
                type="number"
                value={formData.rent}
                onChange={handleChange}
                placeholder="e.g., 15000"
                required
                min="1"
                step="1"
                disabled={isSubmitting}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="e.g., 2"
                required
                min="1"
                step="1"
                disabled={isSubmitting}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="e.g., 1"
                required
                min="1"
                step="1"
                disabled={isSubmitting}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
                Image...
              </>
            ) : isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                Data...
              </>
            ) : (
              "Submit Flat/PG for Approval"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
