"use client"

import { useState } from "react"

import { DataTable } from "./components/data-table"
import type { Order } from "./components/data-table"

import initialOrdersData from "./data.json"

export default function OrdersPage() {
  const [orders] = useState<Order[]>(initialOrdersData as Order[])

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <DataTable orders={orders} />
      </div>
    </div>
  )
}
