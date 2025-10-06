type Payment = {
  id: string
  date: string // ISO yyyy-mm-dd
  amount: number
}

export type Customer = {
  id: string
  name: string
  village: string
  phone: string
  totalAmount: number
  payments: Payment[]
}

type DB = {
  customers: Customer[]
}

const g = globalThis as unknown as { __MEM_DB__?: DB }

function seed(): Customer[] {
  const today = new Date().toISOString().slice(0, 10)
  return [
    {
      id: crypto.randomUUID(),
      name: "Ravi Kumar",
      village: "Lakshmipur",
      phone: "9876543210",
      totalAmount: 12000,
      payments: [
        { id: crypto.randomUUID(), date: today, amount: 4000 },
        { id: crypto.randomUUID(), date: today, amount: 1500 },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Sita Devi",
      village: "Bhargavpur",
      phone: "9876501234",
      totalAmount: 8000,
      payments: [{ id: crypto.randomUUID(), date: today, amount: 3000 }],
    },
  ]
}

function getDB(): DB {
  if (!g.__MEM_DB__) {
    g.__MEM_DB__ = { customers: seed() }
  }
  return g.__MEM_DB__!
}

export function listCustomers(q?: string): Customer[] {
  const { customers } = getDB()
  if (!q) return customers
  const s = q.toLowerCase()
  return customers.filter(
    (c) => c.name.toLowerCase().includes(s) || c.village.toLowerCase().includes(s) || c.phone.toLowerCase().includes(s),
  )
}

export function getCustomer(id: string): Customer | undefined {
  return getDB().customers.find((c) => c.id === id)
}

export function createCustomer(data: {
  name: string
  village: string
  phone: string
  totalAmount: number
}): Customer {
  const c: Customer = {
    id: crypto.randomUUID(),
    name: data.name,
    village: data.village,
    phone: data.phone,
    totalAmount: data.totalAmount,
    payments: [],
  }
  getDB().customers.unshift(c)
  return c
}

export function updateCustomer(
  id: string,
  data: Partial<Pick<Customer, "name" | "village" | "phone" | "totalAmount">>,
): Customer | undefined {
  const c = getCustomer(id)
  if (!c) return undefined
  if (typeof data.name === "string") c.name = data.name
  if (typeof data.village === "string") c.village = data.village
  if (typeof data.phone === "string") c.phone = data.phone
  if (typeof data.totalAmount === "number") c.totalAmount = data.totalAmount
  return c
}

export function deleteCustomer(id: string): boolean {
  const db = getDB()
  const idx = db.customers.findIndex((c) => c.id === id)
  if (idx >= 0) {
    db.customers.splice(idx, 1)
    return true
  }
  return false
}

export function addPayment(id: string, payment: { date: string; amount: number }): Customer | undefined {
  const c = getCustomer(id)
  if (!c) return undefined
  c.payments.push({ id: crypto.randomUUID(), date: payment.date, amount: payment.amount })
  // sort payments by date desc for display convenience
  c.payments.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return c
}
