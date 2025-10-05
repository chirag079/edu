import { auth } from "@/auth";
import { connectToDb } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import { NextResponse } from "next/server";

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

    // Update user profile
    user.phone = formData.get("phone") || user.phone;
    user.address = formData.get("address") || user.address;
    user.city = formData.get("city") || user.city;
    user.state = formData.get("state") || user.state;
    user.country = formData.get("country") || user.country;
    user.college = formData.get("college") || user.college;
    user.bio = formData.get("bio") || user.bio;
    user.isVerified = true;

    // Handle profile picture upload if present
    const profilePicture = formData.get("profilePicture");
    if (profilePicture) {
      console.log(
        "Profile picture received:",
        profilePicture.name,
        profilePicture.size
      );
    }

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
