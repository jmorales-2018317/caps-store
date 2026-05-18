import type { Order } from "@/types";

export type OrderStatus = Order["status"];

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

/** Legacy DB value `confirmed` maps to shipped. */
export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === "confirmed") return "shipped";
  if ((ORDER_STATUSES as string[]).includes(status)) return status as OrderStatus;
  return "pending";
}
