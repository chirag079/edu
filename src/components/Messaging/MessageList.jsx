import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, User } from "lucide-react";

const MessageList = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onStartNewChat,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Messages</CardTitle>
          <Button variant="outline" size="sm" onClick={onStartNewChat}>
            New Chat
          </Button>
        </div>
        <CardDescription>Your conversations with other users</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = activeConversation?._id === conversation._id;
              const otherUser = conversation.participants.find(
                (p) => p._id !== conversation.currentUserId
              );
              const lastMessage = conversation.lastMessage;

              return (
                <div
                  key={conversation._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={otherUser?.image}
                        alt={otherUser?.name}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {otherUser?.name}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="secondary">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <p className="truncate">
                          {lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(lastMessage.createdAt),
                            { addSuffix: true }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MessageList;
