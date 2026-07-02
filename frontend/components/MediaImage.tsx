import Image from "next/image";

import { blurDataURL } from "@/lib/blurhash";
import { resolveMediaUrl } from "@/lib/media-url";
import type { MediaAsset } from "@/lib/types";

interface MediaImageProps {
  asset: MediaAsset;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * next/image wrapper for a hydrated MediaAsset. Uses real width/height for
 * zero layout shift and a blurhash-derived color placeholder.
 */
export default function MediaImage({
  asset,
  sizes = "(max-width: 768px) 100vw, 768px",
  className,
  priority = false,
}: MediaImageProps) {
  const src = resolveMediaUrl(asset.url);
  if (!src) return null;

  const placeholder = blurDataURL(asset.blurhash);
  const objectPosition = `${asset.focal_x * 100}% ${asset.focal_y * 100}%`;

  // Fall back to a plain img sizing when dimensions are unknown.
  if (!asset.width || !asset.height) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={asset.alt_text}
        className={className}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={asset.alt_text}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      className={className}
      priority={priority}
      style={{ objectPosition }}
      placeholder={placeholder ? "blur" : "empty"}
      blurDataURL={placeholder}
    />
  );
}
