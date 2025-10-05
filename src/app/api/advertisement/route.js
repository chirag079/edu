import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Advertisement } from "@/lib/models/advertisement.schema";
import { User } from "@/lib/models/user.schema";
import { getServerSession } from "@/auth";
import { authOptions } from "@/lib/auth";

// Calculate advertisement cost based on type and duration
const calculateAdvertisementCost = (type, duration) => {
  const days = Math.ceil(
    (duration.endDate - duration.startDate) / (1000 * 60 * 60 * 24)
  );
  const monthlyRate = 100; // 100 INR per month
  return Math.ceil((days / 30) * monthlyRate);
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to view advertisements" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // If user is not admin, only show their own advertisements
    if (session.user.role !== "admin") {
      query.advertiser = session.user.id;
    }

    const advertisements = await Advertisement.find(query)
      .populate("advertiser", "name username")
      .sort({ createdAt: -1 });

    return NextResponse.json(advertisements);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to create an advertisement" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { type, entityId, duration } = body;

    // Check if user has sufficient balance
    const user = await User.findById(session.user.id);
    const cost = calculateAdvertisementCost(type, duration);

    if (user.wallet.balance < cost) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // Create advertisement
    const advertisement = new Advertisement({
      type,
      entityId,
      advertiser: session.user.id,
      duration,
      payment: {
        amount: cost,
        status: "pending",
      },
    });

    await advertisement.save();

    // Deduct amount from wallet
    user.wallet.balance -= cost;
    user.wallet.transactions.push({
      type: "debit",
      amount: cost,
      description: `Advertisement for ${type}`,
    });

    await user.save();

    return NextResponse.json(advertisement, { status: 201 });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can update advertisement status" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id, status, adminNotes, rejectionReason } = await request.json();

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    advertisement.status = status;
    if (adminNotes) advertisement.adminNotes = adminNotes;
    if (rejectionReason) advertisement.rejectionReason = rejectionReason;

    await advertisement.save();

    return NextResponse.json(advertisement);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    );
  }
}
