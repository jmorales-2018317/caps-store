export const dashboardRoutes = {
  productos: {
    list: () => "/dashboard/productos",
    crear: () => "/dashboard/productos/crear",
    detail: (id: string) => `/dashboard/productos/${id}`,
    editar: (id: string) => `/dashboard/productos/${id}/editar`,
  },
  categorias: {
    list: () => "/dashboard/categorias",
    crear: () => "/dashboard/categorias/crear",
    detail: (id: string) => `/dashboard/categorias/${id}`,
    editar: (id: string) => `/dashboard/categorias/${id}/editar`,
  },
  estilos: {
    list: () => "/dashboard/estilos",
    crear: () => "/dashboard/estilos/crear",
    detail: (id: string) => `/dashboard/estilos/${id}`,
    editar: (id: string) => `/dashboard/estilos/${id}/editar`,
  },
  descuentos: {
    list: () => "/dashboard/descuentos",
    crear: () => "/dashboard/descuentos/crear",
    detail: (id: string) => `/dashboard/descuentos/${id}`,
    editar: (id: string) => `/dashboard/descuentos/${id}/editar`,
  },
  ordenes: {
    list: () => "/dashboard/ordenes",
    detail: (id: string) => `/dashboard/ordenes/${id}`,
    editar: (id: string) => `/dashboard/ordenes/${id}/editar`,
  },
  perfiles: {
    list: () => "/dashboard/perfiles",
    detail: (id: string) => `/dashboard/perfiles/${id}`,
    editar: (id: string) => `/dashboard/perfiles/${id}/editar`,
  },
} as const;
