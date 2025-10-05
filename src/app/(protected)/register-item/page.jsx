"use client"; // Need client state for tabs

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  NotebookPen,
  Building2,
  UtensilsCrossed,
  CalendarDays,
} from "lucide-react"; // Import appropriate icons

// Import the actual forms
// import BooksForm from "./booksForm"; // Remove BooksForm import
import FlatForm from "./flatForm";
import StationaryForm from "./stationaryForm"; // Import the new form
import RestaurantForm from "./restaurantForm"; // Import the new form
import EventForm from "./EventForm"; // Import with correct capitalization

// Remove dynamic imports if not strictly needed now, or keep if preferred
// import dynamic from "next/dynamic";
// const BooksForm = dynamic(() => import("./booksForm"));
// const FlatForm = dynamic(() => import("./flatForm"));
// const StationaryForm = dynamic(() => import('./stationaryForm'));
// const RestaurantForm = dynamic(() => import('./restaurantForm'));
// const EventForm = dynamic(() => import('./eventForm'));

export default function RegisterItemPage() {
  const [activeTab, setActiveTab] = useState("book_stationary"); // Change default tab

  // Remove placeholder components
  // const StationaryForm = () => <div>Stationary Form Placeholder</div>;
  // const RestaurantForm = () => <div>Restaurant Form Placeholder</div>;
  // const EventForm = () => <div>Event Form Placeholder</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
          Advertise Your Item or Service
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Select the type of item you want to list and fill out the details.
          Listings require admin approval and wallet funds.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Adjust grid columns if needed (e.g., grid-cols-2 sm:grid-cols-4) */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            {/* Combine Book and Stationary */}
            <TabsTrigger value="book_stationary">
              <BookOpen className="mr-1 h-4 w-4" /> Book / Stationary
            </TabsTrigger>
            {/* Keep other triggers */}
            {/* <TabsTrigger value="stationary">
              <NotebookPen className="mr-1 h-4 w-4" /> Stationary
            </TabsTrigger> */}
            <TabsTrigger value="flat_pg">
              <Building2 className="mr-1 h-4 w-4" /> Flat/PG
            </TabsTrigger>
            <TabsTrigger value="restaurant">
              <UtensilsCrossed className="mr-1 h-4 w-4" /> Restaurant
            </TabsTrigger>
            <TabsTrigger value="event">
              <CalendarDays className="mr-1 h-4 w-4" /> Event
            </TabsTrigger>
          </TabsList>

          {/* Remove Book Form Content */}
          {/* <TabsContent value="book"> ... </TabsContent> */}

          {/* Stationary Form Content (now for Book/Stationary) */}
          <TabsContent value="book_stationary">
            <Card className="dark:bg-zinc-800">
              <CardHeader>
                <CardTitle>List a Book or Stationary Item</CardTitle>
                <CardDescription>
                  Provide details about the book or stationary item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StationaryForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep other TabsContent */}
          <TabsContent value="flat_pg">
            <Card className="dark:bg-zinc-800">
              <CardHeader>
                <CardTitle>List a Flat/PG</CardTitle>
                <CardDescription>
                  Provide details about the accommodation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlatForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="restaurant">
            <Card className="dark:bg-zinc-800">
              <CardHeader>
                <CardTitle>List a Restaurant Deal</CardTitle>
                <CardDescription>
                  Describe the offer or special.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RestaurantForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="event">
            <Card className="dark:bg-zinc-800">
              <CardHeader>
                <CardTitle>List an Event</CardTitle>
                <CardDescription>
                  Provide details about the upcoming event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
