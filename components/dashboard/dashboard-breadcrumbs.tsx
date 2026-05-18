import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type DashboardBreadcrumbItem = {
  label: string;
  href?: string;
};

type DashboardBreadcrumbsProps = {
  items: DashboardBreadcrumbItem[];
};

export function DashboardBreadcrumbs({ items }: DashboardBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast || !item.href;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isCurrent ? (
                  <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-xs">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href!} className="max-w-[160px] truncate sm:max-w-xs">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
