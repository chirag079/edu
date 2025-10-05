import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Chat } from "@/lib/models/chat.schema";
import { getServerSession } from "@/auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to view chats" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");

    let query = {
      $or: [{ sender: session.user.id }, { receiver: session.user.id }],
    };

    if (entityId) query.entityId = entityId;
    if (entityType) query.entityType = entityType;

    const chats = await Chat.find(query)
      .populate("sender", "name username")
      .populate("receiver", "name username")
      .sort({ "lastMessage.createdAt": -1 });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to send messages" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { receiverId, entityId, entityType, content } = await request.json();

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      $or: [
        { sender: session.user.id, receiver: receiverId, entityId },
        { sender: receiverId, receiver: session.user.id, entityId },
      ],
    });

    if (!chat) {
      chat = new Chat({
        sender: session.user.id,
        receiver: receiverId,
        entityId,
        entityType,
        messages: [],
      });
    }

    // Add new message
    const message = {
      content,
      sender: session.user.id,
      read: false,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    chat.lastMessage = message;

    await chat.save();

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to update chat" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { chatId, messageId } = await request.json();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Mark message as read
    const message = chat.messages.id(messageId);
    if (message) {
      message.read = true;
      await chat.save();
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}
