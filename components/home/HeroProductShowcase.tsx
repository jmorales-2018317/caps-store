import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroFeaturedImage } from "@/data/heroSlider";

type HeroProductShowcaseProps = {
  image: HeroFeaturedImage;
  className?: string;
};

export function HeroProductShowcase({
  image,
  className,
}: HeroProductShowcaseProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,420px)] sm:max-w-md lg:max-w-none",
        className
      )}
    >
      <div className="relative z-1 motion-safe:animate-hero-float">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority
          sizes="(max-width: 1023px) 88vw, min(52vw, 720px)"
          className={cn(
            "mx-auto h-auto w-full max-h-[min(58vh,520px)] object-contain object-bottom",
            "sm:max-h-[min(62vh,580px)]",
            "lg:mx-0 lg:max-h-[min(88vh,920px)] lg:w-auto lg:max-w-[min(52vw,640px)]",
            "drop-shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          )}
        />
      </div>
    </div>
  );
}
