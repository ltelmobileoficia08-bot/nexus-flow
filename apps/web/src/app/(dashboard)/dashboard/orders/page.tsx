"use client";

import { useEffect, useState } from "react";
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  getSuppliers,
  type Order,
  type Product,
  type Supplier,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Trash2, X, ChevronDown } from "lucide-react";

const STATUS_COLORS: Record<Order["status"], string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: Order["status"][] = [
  "DRAFT", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplierId: "",
    notes: "",
    items: [{ productId: "", quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    Promise.all([getOrders(token), getProducts(token), getSuppliers(token)])
      .then(([o, p, s]) => { setOrders(o); setProducts(p); setSuppliers(s); })
      .finally(() => setLoading(false));
  }, []);

  const token = typeof window !== "undefined" ? localStorage.getItem("nexusflow_token") : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return;
    const created = await createOrder(token, {
      supplierId: form.supplierId,
      notes: form.notes || undefined,
      items: validItems,
    });
    setOrders((prev) => [created, ...prev]);
    resetForm();
  }

  async function handleStatusChange(id: string, status: Order["status"]) {
    if (!token) return;
    const updated = await updateOrderStatus(token, id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setStatusMenuId(null);
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Delete this order?")) return;
    await deleteOrder(token, id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { productId: "", quantity: 1, unitPrice: 0 }] });
  }

  function removeItem(index: number) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  function updateItem(index: number, field: string, value: string | number) {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) items[index].unitPrice = product.unitCost;
    }
    setForm({ ...form, items });
  }

  function resetForm() {
    setShowForm(false);
    setForm({ supplierId: "", notes: "", items: [{ productId: "", quantity: 1, unitPrice: 0 }] });
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            {orders.length} orders · Total: $
            {orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Create Purchase Order
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Supplier</label>
                  <select
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                    value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    required
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Items</label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" /> Add Item
                  </Button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 mb-2">
                    <select
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                      value={item.productId}
                      onChange={(e) => updateItem(i, "productId", e.target.value)}
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                      placeholder="Qty"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                      placeholder="Price"
                    />
                    {form.items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-1">
                  Total: ${form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Order</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-semibold">{order.orderNumber}</span>
                    <p className="text-sm text-muted-foreground">
                      {order.supplier?.name ?? "No supplier"} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">
                    ${order.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                      onClick={() => setStatusMenuId(statusMenuId === order.id ? null : order.id)}
                    >
                      {order.status}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {statusMenuId === order.id && (
                      <div className="absolute right-0 top-8 z-10 rounded-lg border bg-background p-1 shadow-lg">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => handleStatusChange(order.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(order.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
              {order.items.length > 0 && (
                <div className="border-t pt-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-muted-foreground">
                        <span>{item.product.sku} × {item.quantity}</span>
                        <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
