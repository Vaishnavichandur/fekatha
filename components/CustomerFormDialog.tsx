"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  initialData?: {
    id?: number
    name: string
    village: string
    phone: string
    total_amount: string
  }
}

export default function CustomerFormDialog({ open, onOpenChange, onSaved, initialData }: Props) {
  const [form, setForm] = useState({
    name: "",
    village: "",
    phone: "",
    total_amount: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (initialData) setForm(initialData)
    else setForm({ name: "", village: "", phone: "", total_amount: "" })
  }, [initialData])

  const handleSave = async () => {
    if (!form.name || !form.village || !form.phone || form.total_amount === "") return

    const payload = {
      ...form,
      total_amount: Number(form.total_amount) || 0,
    }

    try {
      const url = initialData?.id
        ? `${API_BASE}/api/customers/${initialData.id}/`
        : `${API_BASE}/api/customers/`
      const method = initialData?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onSaved()
        onOpenChange(false)
      } else {
        const errorData = await res.json()
        console.error("Failed to save customer:", errorData)
      }
    } catch (err) {
      console.error("Error saving customer:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="total">Total Amount</Label>
            <Input
              id="total"
              type="number"
              value={form.total_amount}
              placeholder="Enter total amount"
              onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave}>{initialData ? "Update" : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
