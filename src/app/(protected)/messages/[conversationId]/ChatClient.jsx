"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage } from "@/actions/message.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatClient({
  conversationId,
  initialMessages,
  currentUser,
  otherParticipant,
  listing,
}) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change or component mounts
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const tempMessageId = Date.now().toString(); // Temporary ID for optimistic update

    // Optimistic UI update
    const optimisticMessage = {
      _id: tempMessageId,
      content: newMessage.trim(),
      senderId: {
        _id: currentUser.id,
        name: currentUser.name,
        image: currentUser.image,
      },
      createdAt: new Date().toISOString(), // Use ISO string for consistency
      listingId: listing?._id,
      isOptimistic: true, // Flag for styling or identification
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      const result = await sendMessage(
        otherParticipant._id,
        listing._id,
        newMessage.trim()
      );

      if (!result.success) {
        console.error("Failed to send message:", result.message);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
    } finally {
      setIsSending(false);
      // Ensure scroll after potential state updates
      setTimeout(scrollToBottom, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUserSender = message.senderId?._id === currentUser.id;
          const showAvatar =
            index === 0 ||
            messages[index - 1]?.senderId?._id !== message.senderId?._id;

          return (
            <div
              key={message._id}
              className={cn(
                "flex items-end gap-2",
                isCurrentUserSender ? "justify-end" : "justify-start"
              )}
            >
              {/* Avatar for received messages (optional: show only once per consecutive block) */}
              {!isCurrentUserSender && (
                <Avatar
                  className={cn(
                    "h-7 w-7 border",
                    showAvatar ? "visible" : "invisible"
                  )}
                >
                  <AvatarImage
                    src={message.senderId?.image || "/placeholder-user.jpg"}
                    alt={message.senderId?.name}
                  />
                  <AvatarFallback>
                    {message.senderId?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "max-w-[70%] p-2.5 px-3.5 rounded-xl shadow-sm",
                  isCurrentUserSender
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none",
                  message.isOptimistic ? "opacity-70" : ""
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {/* Optional: Timestamp inside bubble */}
                {/* <p className={cn("text-xs mt-1", isCurrentUserSender ? "text-primary-foreground/70" : "text-muted-foreground/70", "text-right")}>
                   {format(new Date(message.createdAt), "p")}
                 </p> */}
              </div>

              {/* Avatar for sent messages (optional: show only once per consecutive block) - can be hidden too */}
              {/* {isCurrentUserSender && (
                 <Avatar className={cn("h-7 w-7", showAvatar ? "visible" : "invisible")}>
                   <AvatarImage src={currentUser.image || "/placeholder-user.jpg"} alt={currentUser.name} />
                   <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
               )} */}
            </div>
          );
        })}
        {/* Dummy div to ensure scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-3 md:p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            maxRows={4} // Adjust max rows as needed
            className="flex-1 resize-none bg-muted border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 pr-12"
            onKeyDown={(e) => {
              // Submit on Enter, Shift+Enter for newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
