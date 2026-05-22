"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  DEFAULT_CATEGORY_IMAGE,
  getServiceImageUrl,
  isLocalMarketplaceImage,
} from "@/src/lib/serviceImage";
import type { MarketplaceItem } from "@/src/lib/api/types";

type ServiceCoverImageProps = {
  service: MarketplaceItem;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Override resolved src (e.g. selected gallery thumb). */
  src?: string;
};

export function ServiceCoverImage({
  service,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority,
  src: srcOverride,
}: ServiceCoverImageProps) {
  const [imageSrc, setImageSrc] = useState(
    () => srcOverride ?? getServiceImageUrl(service),
  );

  useEffect(() => {
    setImageSrc(srcOverride ?? getServiceImageUrl(service));
  }, [srcOverride, service.coverImageUrl, service.imageUrl, service.categoryName, service.category]);

  function handleImageError() {
    if (imageSrc !== DEFAULT_CATEGORY_IMAGE) {
      setImageSrc(DEFAULT_CATEGORY_IMAGE);
    }
  }

  const useUnoptimized =
    !isLocalMarketplaceImage(imageSrc) &&
    (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"));

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={useUnoptimized}
      onError={handleImageError}
    />
  );
}
