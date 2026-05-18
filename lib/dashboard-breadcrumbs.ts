import type { DashboardBreadcrumbItem } from "@/components/dashboard/dashboard-breadcrumbs";
import { dashboardRoutes } from "@/lib/dashboard-routes";

export const dashboardBreadcrumbs = {
  productos: {
    crear: (): DashboardBreadcrumbItem[] => [
      { label: "Productos", href: dashboardRoutes.productos.list() },
      { label: "Crear producto" },
    ],
    detail: (name: string): DashboardBreadcrumbItem[] => [
      { label: "Productos", href: dashboardRoutes.productos.list() },
      { label: name },
    ],
    editar: (name: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Productos", href: dashboardRoutes.productos.list() },
      { label: name, href: dashboardRoutes.productos.detail(id) },
      { label: "Editar" },
    ],
  },
  categorias: {
    crear: (): DashboardBreadcrumbItem[] => [
      { label: "Categorias", href: dashboardRoutes.categorias.list() },
      { label: "Crear categoria" },
    ],
    detail: (label: string): DashboardBreadcrumbItem[] => [
      { label: "Categorias", href: dashboardRoutes.categorias.list() },
      { label },
    ],
    editar: (label: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Categorias", href: dashboardRoutes.categorias.list() },
      { label, href: dashboardRoutes.categorias.detail(id) },
      { label: "Editar" },
    ],
  },
  estilos: {
    crear: (): DashboardBreadcrumbItem[] => [
      { label: "Estilos", href: dashboardRoutes.estilos.list() },
      { label: "Crear estilo" },
    ],
    detail: (label: string): DashboardBreadcrumbItem[] => [
      { label: "Estilos", href: dashboardRoutes.estilos.list() },
      { label },
    ],
    editar: (label: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Estilos", href: dashboardRoutes.estilos.list() },
      { label, href: dashboardRoutes.estilos.detail(id) },
      { label: "Editar" },
    ],
  },
  descuentos: {
    crear: (): DashboardBreadcrumbItem[] => [
      { label: "Descuentos", href: dashboardRoutes.descuentos.list() },
      { label: "Crear descuento" },
    ],
    detail: (name: string): DashboardBreadcrumbItem[] => [
      { label: "Descuentos", href: dashboardRoutes.descuentos.list() },
      { label: name },
    ],
    editar: (name: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Descuentos", href: dashboardRoutes.descuentos.list() },
      { label: name, href: dashboardRoutes.descuentos.detail(id) },
      { label: "Editar" },
    ],
  },
  ordenes: {
    detail: (shortId: string): DashboardBreadcrumbItem[] => [
      { label: "Ordenes", href: dashboardRoutes.ordenes.list() },
      { label: `Orden #${shortId}` },
    ],
    editar: (shortId: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Ordenes", href: dashboardRoutes.ordenes.list() },
      { label: `Orden #${shortId}`, href: dashboardRoutes.ordenes.detail(id) },
      { label: "Editar" },
    ],
  },
  perfiles: {
    detail: (name: string): DashboardBreadcrumbItem[] => [
      { label: "Perfiles", href: dashboardRoutes.perfiles.list() },
      { label: name },
    ],
    editar: (name: string, id: string): DashboardBreadcrumbItem[] => [
      { label: "Perfiles", href: dashboardRoutes.perfiles.list() },
      { label: name, href: dashboardRoutes.perfiles.detail(id) },
      { label: "Editar" },
    ],
  },
} as const;
