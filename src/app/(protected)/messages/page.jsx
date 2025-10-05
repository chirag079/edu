import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserConversations } from "@/actions/message.actions";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/login?error=SessionExpired");
  }

  const conversations = await getUserConversations();

  return (
    <MessagesClient initialConversations={conversations} session={session} />
  );
}
