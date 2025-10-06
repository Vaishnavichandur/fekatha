"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Utility function to format currency
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

type Payment = { id: number; date: string; amount: number }
type Item = {
  id: number
  name: string
  village: string
  phone: string
  totalAmount: number
  paid: number
  due: number
  payments: Payment[]
}

// Fetcher using environment variable for base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Item | null
  onUpdated: () => void
}) {
  const id = customer?.id
  const { data } = useSWR<{ item: Item }>(
    id ? `${API_BASE}/api/customers/${id}/` : null,
    fetcher
  )
  const item = data?.item ?? customer ?? null

  const [form, setForm] = useState({
    name: "",
    village: "",
    phone: "",
    totalAmount: 0,
  })

  // Sync form when modal opens or customer changes
  useEffect(() => {
    if (open && item) {
      setForm({
        name: item.name,
        village: item.village,
        phone: item.phone,
        totalAmount: item.totalAmount,
      })
    }
  }, [open, item])

  const [pay, setPay] = useState({ date: new Date().toISOString().slice(0, 10), amount: "" })

  async function save() {
    if (!id) return
    const res = await fetch(`${API_BASE}/api/customers/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        village: form.village.trim(),
        phone: form.phone.trim(),
        totalAmount: Number(form.totalAmount),
      }),
    })
    if (res.ok) onUpdated()
  }

  async function addPayment() {
    if (!id) return
    const amount = Number(pay.amount)
    if (!amount || amount <= 0) return
    const res = await fetch(`${API_BASE}/api/customers/${id}/payments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: pay.date, amount }),
    })
    if (res.ok) {
      setPay((p) => ({ ...p, amount: "" }))
      onUpdated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        {!item ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Total / Paid / Due */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-xl font-medium">{formatCurrency(item.totalAmount)}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-xl font-medium">{formatCurrency(item.paid)}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">Due</div>
                <div className="text-xl font-medium">{formatCurrency(item.due)}</div>
              </div>
            </section>

            {/* Edit Customer */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Edit Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Village</Label>
                  <Input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    value={form.totalAmount}
                    onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={save}>Save</Button>
              </div>
            </section>

            {/* Payments */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Payments</h3>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2}>No payments yet.</TableCell>
                      </TableRow>
                    ) : (
                      item.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.date}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={pay.amount}
                    onChange={(e) => setPay({ ...pay, amount: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addPayment}>Add Payment</Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
