import type { ReactNode } from "react";
import {
  DashboardBreadcrumbs,
  type DashboardBreadcrumbItem,
} from "@/components/dashboard/dashboard-breadcrumbs";
import { EntityHeader } from "@/components/dashboard/entity-header";

type EntityDetailShellProps = {
  breadcrumbs: DashboardBreadcrumbItem[];
  badge: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function EntityDetailShell({
  breadcrumbs,
  badge,
  title,
  description,
  actions,
  children,
}: EntityDetailShellProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <DashboardBreadcrumbs items={breadcrumbs} />
      <EntityHeader
        badge={badge}
        title={title}
        description={description ?? ""}
        action={actions}
      />
      {children}
    </div>
  );
}
