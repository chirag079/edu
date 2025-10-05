"use client"; // Carousels often need client-side interactivity

import * as React from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/ItemCard";

// The main carousel component
export default function ServiceCarousel({ title, items = [], icon, itemType }) {
  if (!items || items.length === 0) {
    return (
      <div>
        <div className="flex items-center mb-4">
          {icon}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No {itemType ? itemType.toLowerCase() + "s" : title.toLowerCase()}{" "}
          found for your college yet.
        </p>
      </div>
    );
  }

  // Generate a potential search link based on itemType
  const searchLink = itemType
    ? `/search?itemType=${encodeURIComponent(itemType)}`
    : "/search";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
        </div>
        {/* Link to search page filtered by this type */}
        <Link href={searchLink} passHref>
          <Button variant="ghost" size="sm">
            See All
          </Button>
        </Link>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 p-2"
            >
              <ItemCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
      </Carousel>
    </div>
  );
}
