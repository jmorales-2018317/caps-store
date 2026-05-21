import type { Metadata } from "next";
import { CapCustomizationClient } from "@/components/cap/cap-customization-client";

export const metadata: Metadata = {
  title: "Personalizar gorra",
  description:
    "Vista previa 3D de tu gorra. Cambia el color de la tela y del broche en tiempo real.",
};

export default function PersonalizarPage() {
  return <CapCustomizationClient />;
}
