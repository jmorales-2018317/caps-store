import type { ReactNode } from "react";
import {
  DashboardBreadcrumbs,
  type DashboardBreadcrumbItem,
} from "@/components/dashboard/dashboard-breadcrumbs";
import { EntityHeader } from "@/components/dashboard/entity-header";

type EntityFormShellProps = {
  breadcrumbs: DashboardBreadcrumbItem[];
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
};

/** Mismo patron que listas y detalle: breadcrumbs + EntityHeader + contenido. */
export function EntityFormShell({
  breadcrumbs,
  badge,
  title,
  description,
  children,
}: EntityFormShellProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <DashboardBreadcrumbs items={breadcrumbs} />
      <EntityHeader badge={badge} title={title} description={description} />
      {children}
    </div>
  );
}
