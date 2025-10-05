import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Note: This is a placeholder form. Real implementation requires a backend endpoint or service.
export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-xl mx-auto dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            Contact Us
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-400">
            Have questions or feedback? Reach out!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your Name"
                  className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="dark:text-gray-300">
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="Subject of your message"
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="dark:text-gray-300">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Your message..."
                rows={5}
                className="dark:bg-zinc-700 dark:text-gray-50 dark:border-zinc-600"
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
