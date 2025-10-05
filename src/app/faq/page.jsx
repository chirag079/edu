import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqData = [
  {
    question: "What is EduStation?",
    answer:
      "EduStation is a marketplace designed for college students to buy, sell, or discover items and services like books, stationary, accommodation, restaurant deals, and events within their campus community.",
  },
  {
    question: "How does advertising work?",
    answer:
      "Advertisers need to purchase wallet tokens (1 token = ₹1). Listing books/stationary costs 10% of MRP or ₹20 (whichever is higher). Listing flats/PGs, restaurant deals, or events costs ₹100 for one month. Listings require admin approval before appearing publicly.",
  },
  {
    question: "How do I complete my profile?",
    answer:
      "After signing up, you will be prompted to complete your profile by providing details like phone number, address, and your college (NSUT, DTU, or IPU). Verification is required to start using all platform features.",
  },
  {
    question: "Can I change my role (Explorer/Advertiser)?",
    answer:
      "Currently, role selection happens at signup or is managed by administrators. Please contact support if you need to change your role.",
  },
  {
    question: "Is there a rating system?",
    answer:
      "A rating system for services and advertisers is planned for a future update.",
  },
  {
    question: "How does the chat feature work?",
    answer:
      "A direct chat feature between explorers and advertisers for query resolution is planned for a future update.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-3xl mx-auto dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline dark:text-gray-200">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="prose prose-gray dark:prose-invert max-w-none">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
