"use client";

import { useEffect, useRef, useState } from "react";

export default function AboutPhoto({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const [ok, setOk] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image already failed to load before React hydrated (so the
  // onError event was missed), detect it here: a finished load with zero
  // natural width means the file is missing/broken.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setOk(false);
  }, []);

  if (!ok) return null;

  return (
    <figure className="mt-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onError={() => setOk(false)}
        className="w-full rounded-2xl border border-calm-100 shadow-soft"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-calm-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
