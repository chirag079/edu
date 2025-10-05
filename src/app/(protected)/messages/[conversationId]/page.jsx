import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getConversationDetails,
  getMessagesForConversation,
  markConversationAsRead,
} from "@/actions/message.actions";
import ChatClient from "./ChatClient"; // We will create this next
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ConversationPage({ params }) {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login?error=SessionExpired");
  }

  const conversationId = params.conversationId;

  // Fetch conversation details and messages in parallel
  const [conversationDetails, initialMessages] = await Promise.all([
    getConversationDetails(conversationId),
    getMessagesForConversation(conversationId),
    // Mark conversation as read (fire-and-forget, don't need to wait for UI)
    markConversationAsRead(conversationId),
  ]);

  // If conversation details couldn't be fetched (not found, auth error), show 404
  if (!conversationDetails) {
    notFound(); // Renders the nearest not-found.jsx file
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with back button and context */}
      <header className="flex items-center justify-between p-3 border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages" aria-label="Back to messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          {/* Display other participant's name and listing title */}
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {conversationDetails.otherParticipant?.name || "Unknown User"}
            </h1>
            {conversationDetails.listing && (
              <Link
                href={`/listing/${conversationDetails.listing._id}`}
                className="text-xs text-muted-foreground hover:underline truncate"
                title={conversationDetails.listing.title}
              >
                {conversationDetails.listing.title}
              </Link>
            )}
          </div>
        </div>
        {/* Add other potential header actions here (e.g., archive button) */}
      </header>

      {/* Pass data to the client component for chat UI */}
      <ChatClient
        conversationId={conversationId}
        initialMessages={initialMessages}
        currentUser={session.user}
        otherParticipant={conversationDetails.otherParticipant}
        listing={conversationDetails.listing}
      />
    </div>
  );
}
