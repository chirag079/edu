import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import { getServerSession } from "@/auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to view wallet" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select("wallet");

    return NextResponse.json(user.wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to recharge wallet" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { amount, transactionId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: "credit",
      amount,
      description: "Wallet recharge",
      transactionId,
    });

    await user.save();

    return NextResponse.json(user.wallet);
  } catch (error) {
    console.error("Error recharging wallet:", error);
    return NextResponse.json(
      { error: "Failed to recharge wallet" },
      { status: 500 }
    );
  }
}
