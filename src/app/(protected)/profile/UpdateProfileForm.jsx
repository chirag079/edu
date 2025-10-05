"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Renamed props for clarity
export default function UpdateProfileForm({ userdetails }) {
  const router = useRouter();
  const { update: updateSession } = useSession(); // Renamed to avoid conflict
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Initialize state from props, ensuring proper defaults
  const [formData, setFormData] = useState({
    phone: userdetails?.phone || "",
    address: userdetails?.address || "",
    city: userdetails?.city || "",
    state: userdetails?.state || "",
    country: userdetails?.country || "",
    college: userdetails?.college || "",
    bio: userdetails?.bio || "",
    profilePicture: null, // Reset picture on each load for update
  });

  // Clear errors when form data changes
  useEffect(() => {
    setError("");
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      college: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Guard Clause: Ensure userdetails is available
    if (!userdetails) {
      setError("User data not available. Cannot update profile.");
      toast.error("User data not available. Please refresh.");
      return;
    }

    startTransition(async () => {
      try {
        const formDataToSend = new FormData();
        // Only append fields that have changed or the picture
        let hasChanges = false;
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "profilePicture" && value) {
            formDataToSend.append(key, value);
            hasChanges = true;
          } else if (key !== "profilePicture" && value !== userdetails[key]) {
            // Append only if value exists and is different from original
            // Check if value is not null/undefined before appending
            if (value !== null && value !== undefined) {
              formDataToSend.append(key, value);
              hasChanges = true;
            }
          }
        });

        if (!hasChanges) {
          toast.info("No changes detected.");
          return;
        }

        // Use a different API endpoint for updates
        const response = await fetch("/api/user/update-profile", {
          method: "POST", // Or PUT, ensure API route matches
          body: formDataToSend,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update profile");
        }

        // Update session client-side AFTER successful API call
        await updateSession();

        toast.success("Profile updated successfully");
        // Optionally refresh the page or specific data
        router.refresh(); // Refreshes server components on the current route
      } catch (err) {
        console.error("Update error:", err);
        setError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Update failed.");
      }
    });
  };

  // Basic structure mirroring complete-profile page
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your 10-digit phone number"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profilePicture">Update Profile Picture</Label>
          <Input
            id="profilePicture"
            name="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter your state"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter your country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="college">College</Label>
          <Select
            name="college"
            onValueChange={handleSelectChange}
            value={formData.college}
          >
            <SelectTrigger id="college">
              <SelectValue placeholder="Select your college" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NSUT">NSUT</SelectItem>
              <SelectItem value="DTU">DTU</SelectItem>
              <SelectItem value="IPU">IPU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
          </>
        ) : (
          "Update Profile"
        )}
      </Button>
    </form>
  );
}
