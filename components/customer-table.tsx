"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomerDetailDialog } from "./customer-detail-dialog"
import CustomerFormDialog from "./CustomerFormDialog"

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

type Payment = { id: number; date: string; amount: number }
type Item = {
  id: number
  name: string
  village: string
  phone: string
  total_amount: number
  paid: number
  due: number
  payments: Payment[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CustomerTable() {
  const [query, setQuery] = useState("")
  const endpoint = `${API_BASE}/api/customers/${query ? `?q=${encodeURIComponent(query)}` : ""}`
  const { data, isLoading } = useSWR<{ items: Item[] }>(endpoint, fetcher)

  const items = data?.items ?? []
  const totals = items.reduce(
    (acc, c) => {
      acc.total += Number(c.total_amount ?? 0)
      acc.paid += Number(c.paid ?? 0)
      acc.due += Number(c.due ?? 0)
      return acc
    },
    { total: 0, paid: 0, due: 0 }
  )

  const [selectedCustomer, setSelectedCustomer] = useState<Item | null>(null)
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Item | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}/`, { method: "DELETE" })
      if (res.ok) mutate(endpoint)
      else console.error("Failed to delete customer")
    } catch (err) {
      console.error("Error deleting customer:", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <input
            placeholder="Search by name, village, phone"
            className="border rounded px-2 py-1 w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="secondary" onClick={() => setQuery("")}>
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddingCustomer(true)}>Add Customer</Button>
          <Button
            variant="secondary"
            onClick={() => window.open(`${API_BASE}/api/customers/export/`, "_blank")}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Village</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No customers found.</TableCell>
              </TableRow>
            )}
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.village}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell className="text-right">
  {formatCurrency(Number(c.total_amount ?? 0))}
</TableCell>

                <TableCell className="text-right">{formatCurrency(Number(c.paid ?? 0))}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(c.due ?? 0))}</TableCell>
                <TableCell className="text-right flex justify-end gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedCustomer(c)}>
                    View
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <CustomerDetailDialog
        open={!!selectedCustomer}
        onOpenChange={(o) => !o && setSelectedCustomer(null)}
        customer={selectedCustomer}
        onUpdated={() => mutate(endpoint)}
      />

      <CustomerFormDialog
        open={addingCustomer}
        onOpenChange={setAddingCustomer}
        onSaved={() => mutate(endpoint)}
      />

      <CustomerFormDialog
        open={!!editingCustomer}
        onOpenChange={(o) => !o && setEditingCustomer(null)}
        onSaved={() => mutate(endpoint)}
        initialData={
          editingCustomer
            ? {
                name: editingCustomer.name,
                village: editingCustomer.village,
                phone: editingCustomer.phone,
                total_amount: editingCustomer.total_amount.toString(),
                id: editingCustomer.id,
              }
            : undefined
        }
      />
    </div>
  )
}
