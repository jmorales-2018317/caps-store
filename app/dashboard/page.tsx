import { EntityView } from "@/components/dashboard/entity-view"

export default function Page() {
  return (
    <EntityView
      badge="Crea Caps Admin"
      title="Dashboard de gestion"
      description="Vista principal del panel, alineada visualmente con la aplicacion principal."
      ctaLabel="Administrar productos"
      ctaHref="/dashboard/productos"
      rows={[
        {
          principal: "Snapback Classic Black",
          secondary: "Producto destacado",
          amount: "GTQ 320",
          status: "Activo",
        },
        {
          principal: "Bucket Urban Sand",
          secondary: "Categoria: Bucket",
          amount: "GTQ 280",
          status: "Borrador",
        },
        {
          principal: "Dad Hat Stone Logo",
          secondary: "Categoria: Dad Hat",
          amount: "GTQ 250",
          status: "Activo",
        },
      ]}
    />
  )
}
