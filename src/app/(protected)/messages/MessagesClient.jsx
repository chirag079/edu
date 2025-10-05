"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Circle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function MessagesClient({ initialConversations, session }) {
  const [conversations, setConversations] = useState(
    initialConversations || []
  );

  const truncateText = (text, length = 50) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
        </div>

        {conversations.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground text-center">
                No conversations yet.
              </p>
              <p className="text-sm text-muted-foreground/80 text-center mt-1">
                Start a conversation by messaging someone from a listing page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              if (
                !conv.otherParticipant ||
                !conv.listing ||
                !conv.lastMessage
              ) {
                console.warn(
                  "Skipping conversation with missing data:",
                  conv._id
                );
                return null;
              }
              const otherUser = conv.otherParticipant;
              const listing = conv.listing;
              const lastMsg = conv.lastMessage;

              return (
                <Link
                  href={`/messages/${conv._id}`}
                  key={conv._id}
                  className="block group"
                >
                  <Card
                    className={cn(
                      "transition-all duration-150 ease-in-out border-border group-hover:border-primary/50 group-hover:shadow-sm",
                      conv.isUnread ? "bg-primary/5%" : "bg-card"
                    )}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-border/50">
                        <AvatarImage
                          src={otherUser.image || "/placeholder-user.jpg"}
                          alt={otherUser.name}
                        />
                        <AvatarFallback>
                          {otherUser.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-baseline mb-1">
                          <p
                            className="font-semibold text-sm text-foreground truncate"
                            title={otherUser.name}
                          >
                            {otherUser.name}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(lastMsg.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center mb-1">
                          <span
                            className="text-xs text-muted-foreground truncate"
                            title={`Listing: ${listing.title}`}
                          >
                            Re: {listing.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="ml-1 scale-90 px-1.5 py-0"
                          >
                            {listing.itemType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate pr-2">
                            {lastMsg.isSender && (
                              <span className="font-medium">You: </span>
                            )}
                            {truncateText(lastMsg.content)}
                          </p>
                          {conv.isUnread && (
                            <Circle
                              fill="hsl(var(--primary))"
                              className="h-2.5 w-2.5 text-primary shrink-0"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
