"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/actions/message.actions";
import { useSession } from "next-auth/react";

export default function ContactAdvertiser({ listing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { data: session } = useSession();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!session?.user) {
      toast.error("Please login to send messages");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendMessage(
        listing.advertiserId._id,
        listing._id,
        message
      );

      if (result.success) {
        toast.success("Message sent successfully");
        setMessage("");
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Don't show the button if the user is the advertiser
  if (session?.user?.id === listing.advertiserId._id) {
    return null;
  }

  // Only show to explorers
  if (session?.user?.role !== "explorer") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Advertiser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Advertiser</DialogTitle>
          <DialogDescription>
            Send a message to {listing.advertiserId.name || "the advertiser"}{" "}
            about {listing.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
