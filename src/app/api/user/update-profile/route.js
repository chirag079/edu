import { auth } from "@/auth";
import { connectToDb } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import { NextResponse } from "next/server";

// Route specifically for handling updates to an existing profile
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const userId = session.user.id;

    await connectToDb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create an update object only with fields present in the form data
    const updates = {};
    if (formData.has("phone")) updates.phone = formData.get("phone");
    if (formData.has("address")) updates.address = formData.get("address");
    if (formData.has("city")) updates.city = formData.get("city");
    if (formData.has("state")) updates.state = formData.get("state");
    if (formData.has("country")) updates.country = formData.get("country");
    if (formData.has("college")) updates.college = formData.get("college");
    if (formData.has("bio")) updates.bio = formData.get("bio");
    // Do NOT update isVerified here

    // Handle profile picture update if present
    const profilePicture = formData.get("profilePicture");
    if (profilePicture) {
      // Placeholder: Implement actual image upload logic here
      console.log(
        "Profile picture update received:",
        profilePicture.name,
        profilePicture.size
      );
      // updates.profilePictureUrl = uploadedImageUrl; // Save the URL
    }

    // Check if there are any updates to apply
    if (Object.keys(updates).length === 0 && !profilePicture) {
      return NextResponse.json(
        { message: "No update data provided" },
        { status: 400 }
      );
    }

    // Apply updates to the user object
    Object.assign(user, updates);

    await user.save();

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
