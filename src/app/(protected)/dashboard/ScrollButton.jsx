"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";

function scrollRight() {
  const container = document.querySelector(".overflow-x-scroll");

  container.scrollLeft += 250;
}
function scrollLeft() {
  const container = document.querySelector(".overflow-x-scroll");
  if (container.scrollLeft > 0) {
    container.scrollLeft -= 200;
  }
}
export function ScrollRight() {
  return (
    <ChevronRight
      className="hover:bg-muted transition-all duration-200 delay-75 rounded scale-105"
      onClick={scrollRight}
    />
  );
}
export function ScrollLeft() {
  return (
    <ChevronLeft
      className="hover:bg-muted transition-all duration-200 delay-75 rounded scale-105"
      onClick={scrollLeft}
    />
  );
}
