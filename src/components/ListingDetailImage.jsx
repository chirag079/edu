"use client";

import { useState } from "react";
import Image from "next/image";

const placeholderImage = "/placeholder-image.png"; // Default placeholder

export default function ListingDetailImage({ src, alt, ...props }) {
  const [imageSrc, setImageSrc] = useState(src || placeholderImage);

  const handleError = () => {
    setImageSrc(placeholderImage);
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={props.priority}
      onError={handleError} // Use the error handler defined in this client component
    />
  );
}
