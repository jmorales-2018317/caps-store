export const heroSliderImages = [
  {
    src: "/cap-model-1.png",
    alt: "Modelo 1",
  },
  {
    src: "/cap-model-2.png",
    alt: "Modelo 2",
  },
  {
    src: "/cap-model-3.png",
    alt: "Modelo 3",
  },
] as const;

export type HeroSlide = (typeof heroSliderImages)[number];
