"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { createEvent } from "@/actions/listing.actions";
import { uploadImage } from "@/actions/upload.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import AIDescriptionWriter from "@/components/AIDescriptionWriter";

export default function EventForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "",
    organizer: "",
    contact: {
      email: session?.user?.email || "",
      phone: "",
      website: "",
    },
    registrationRequired: false,
    registrationLink: "",
    price: 0,
    tags: "",
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
      setError("");
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!imageFile) {
      setError("Please upload an image for the event (e.g., Poster).");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.startDate ||
      !formData.location ||
      !formData.category ||
      !formData.organizer
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Upload image first
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
    setIsSubmitting(true);

    try {
      // Process tags if provided
      const processedData = {
        ...formData,
        images: [uploadedImageUrl], // Add the uploaded image URL
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      const result = await createEvent(processedData);

      if (result.success) {
        toast.success("Event submitted successfully!");
        router.push("/dashboard");
      } else {
        setError(result.message || "Failed to submit event");
        toast.error(result.message || "Failed to submit event");
      }
    } catch (err) {
      console.error("Error submitting event:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isUploading || isSubmitting;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="event-image">
              Event Image/Poster (Required, &lt;1MB)
            </Label>
            <Input
              id="event-image"
              name="image"
              type="file"
              accept="image/jpeg, image/png, image/webp, image/gif"
              onChange={handleImageChange}
              disabled={isProcessing}
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
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a detailed description of the event"
              required
              disabled={isProcessing}
              className="min-h-[120px] dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
            <AIDescriptionWriter
              itemType="Event"
              title={formData.title}
              onDescriptionGenerated={(description) =>
                setFormData((prev) => ({ ...prev, description }))
              }
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600 dark:[color-scheme:dark]"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600 dark:[color-scheme:dark]"
              min={formData.startDate || new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Auditorium, NSUT Campus"
              required
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              disabled={isProcessing}
            >
              <SelectTrigger className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <Label htmlFor="organizer">Organizer</Label>
            <Input
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="e.g., Computer Society, XYZ Club"
              required
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label>Contact Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact.email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="contact.email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="Contact email"
                  type="email"
                  disabled={isProcessing}
                  className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
                />
              </div>
              <div>
                <Label htmlFor="contact.phone" className="text-sm">
                  Phone
                </Label>
                <Input
                  id="contact.phone"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  placeholder="Contact phone"
                  disabled={isProcessing}
                  className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contact.website" className="text-sm">
                Website (Optional)
              </Label>
              <Input
                id="contact.website"
                name="contact.website"
                value={formData.contact.website}
                onChange={handleChange}
                placeholder="Event website or registration page"
                disabled={isProcessing}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
          </div>

          {/* Registration Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="registrationRequired"
              name="registrationRequired"
              checked={formData.registrationRequired}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  registrationRequired: checked,
                }));
              }}
              disabled={isProcessing}
            />
            <Label
              htmlFor="registrationRequired"
              className="text-sm font-medium"
            >
              Registration required
            </Label>
          </div>

          {/* Registration Link (conditionally rendered) */}
          {formData.registrationRequired && (
            <div className="space-y-2">
              <Label htmlFor="registrationLink">Registration Link</Label>
              <Input
                id="registrationLink"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="Enter registration link"
                disabled={isProcessing}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Leave at 0 for free events
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Comma Separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., music, technology, networking"
              disabled={isProcessing}
              className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isProcessing} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
                Image...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                Event...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
