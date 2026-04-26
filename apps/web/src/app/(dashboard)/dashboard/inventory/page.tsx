"use client";

import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Pencil, Trash2, X, Search } from "lucide-react";

function getStockStatus(product: Product) {
  if (product.currentStock <= product.safetyStock)
    return { label: "Critical", variant: "destructive" as const };
  if (product.currentStock <= product.reorderPoint)
    return { label: "Low Stock", variant: "destructive" as const };
  if (product.currentStock > product.reorderPoint * 3)
    return { label: "Overstock", variant: "secondary" as const };
  return { label: "Optimal", variant: "default" as const };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    currentStock: 0,
    reorderPoint: 0,
    safetyStock: 0,
    unitCost: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    getProducts(token).then(setProducts).finally(() => setLoading(false));
  }, []);

  const token = typeof window !== "undefined" ? localStorage.getItem("nexusflow_token") : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (editingId) {
      const updated = await updateProduct(token, editingId, form);
      setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
    } else {
      const created = await createProduct(token, form);
      setProducts((prev) => [created, ...prev]);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Delete this product?")) return;
    await deleteProduct(token, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      currentStock: product.currentStock,
      reorderPoint: product.reorderPoint,
      safetyStock: product.safetyStock,
      unitCost: product.unitCost,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ sku: "", name: "", description: "", currentStock: 0, reorderPoint: 0, safetyStock: 0, unitCost: 0 });
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0);

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            {products.length} products · Total value: ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? "Edit Product" : "New Product"}
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!editingId} />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Unit Cost ($)</label>
                <Input type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Point</label>
                <Input type="number" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Safety Stock</label>
                <Input type="number" value={form.safetyStock} onChange={(e) => setForm({ ...form, safetyStock: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Create"} Product</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((product) => {
          const status = getStockStatus(product);
          return (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.name}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.sku} · {product.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold">{product.currentStock} units</p>
                    <p className="text-sm text-muted-foreground">
                      ${product.unitCost.toFixed(2)}/unit · Value: ${(product.currentStock * product.unitCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Reorder: {product.reorderPoint}</p>
                    <p>Safety: {product.safetyStock}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No products found.</p>
        )}
      </div>
    </div>
  );
}
