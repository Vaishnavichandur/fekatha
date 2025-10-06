"use client"

import { useState, useEffect } from "react"
import CustomerTable from "@/components/customer-table"


export default function Page() {

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">
          Saraswathi Silver Merchant
        </h1>
      </header>

      <CustomerTable />
    </main>
  )
}
