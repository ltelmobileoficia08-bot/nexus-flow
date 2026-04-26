"use client";

import { useEffect, useState } from "react";
import {
  getSuppliers,
  getNotificationStatus,
  getEmailTemplates,
  sendRfqEmail,
  getProducts,
  type Supplier,
  type Product,
  type NotificationStatus,
  type EmailTemplate,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Star,
  TrendingDown,
  Mail,
  Send,
  FileText,
  X,
} from "lucide-react";

export default function NegotiationsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [emailStatus, setEmailStatus] = useState<NotificationStatus | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [rfqModal, setRfqModal] = useState<string | null>(null);
  const [rfqProducts, setRfqProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [rfqNotes, setRfqNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ message: string; preview?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    Promise.all([
      getSuppliers(token),
      getProducts(token),
      getNotificationStatus(token),
      getEmailTemplates(token),
    ])
      .then(([s, p, ns, t]) => {
        setSuppliers(s);
        setProducts(p);
        setEmailStatus(ns);
        setTemplates(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const openRfq = (supplierId: string) => {
    setRfqModal(supplierId);
    setRfqProducts([{ name: products[0]?.name ?? "", quantity: 100 }]);
    setRfqNotes("");
    setSendResult(null);
  };

  const handleSendRfq = async () => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token || !rfqModal) return;
    setSending(true);
    try {
      const result = await sendRfqEmail(token, {
        supplierId: rfqModal,
        products: rfqProducts.filter((p) => p.name && p.quantity > 0),
        notes: rfqNotes || undefined,
      });
      setSendResult({ message: result.message, preview: result.preview });
    } catch (e) {
      setSendResult({ message: e instanceof Error ? e.message : "Failed to send" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading negotiations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Negotiations & Notifications</h1>
        <p className="text-muted-foreground">
          Supplier negotiation management with automated email notifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Suppliers
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                suppliers.reduce((sum, s) => sum + (s.rating ?? 0), 0) /
                (suppliers.length || 1)
              ).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Potential
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email Status
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={emailStatus?.configured ? "outline" : "secondary"}>
              {emailStatus?.configured ? "SendGrid Active" : "Demo Mode"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Negotiation Status</CardTitle>
            <CardDescription>
              Send RFQs and manage supplier communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {supplier.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${n <= (supplier.rating ?? 0) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <Badge
                      variant={
                        supplier._count && supplier._count.orders > 1
                          ? "default"
                          : "secondary"
                      }
                    >
                      {supplier._count?.orders ?? 0} orders
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRfq(supplier.id)}
                    >
                      <Send className="mr-1 h-3.5 w-3.5" />
                      Send RFQ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>Available notification templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
            {!emailStatus?.configured && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  Set <code>SENDGRID_API_KEY</code> to enable real email
                  delivery. Emails are previewed in demo mode.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {rfqModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Send RFQ to{" "}
                {suppliers.find((s) => s.id === rfqModal)?.name}
              </h3>
              <button
                onClick={() => setRfqModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Products</label>
                {rfqProducts.map((p, i) => (
                  <div key={i} className="flex gap-2 mt-2">
                    <select
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...rfqProducts];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setRfqProducts(updated);
                      }}
                      className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
                    >
                      <option value="">Select product...</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.name}>
                          {prod.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => {
                        const updated = [...rfqProducts];
                        updated[i] = {
                          ...updated[i],
                          quantity: parseInt(e.target.value) || 0,
                        };
                        setRfqProducts(updated);
                      }}
                      className="w-24 rounded-md border px-3 py-2 text-sm bg-background"
                      placeholder="Qty"
                    />
                    {rfqProducts.length > 1 && (
                      <button
                        onClick={() =>
                          setRfqProducts(rfqProducts.filter((_, j) => j !== i))
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setRfqProducts([
                      ...rfqProducts,
                      { name: "", quantity: 100 },
                    ])
                  }
                  className="text-sm text-primary mt-2 hover:underline"
                >
                  + Add product
                </button>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background min-h-[80px]"
                  placeholder="Additional notes for the supplier..."
                />
              </div>
              {sendResult && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">{sendResult.message}</p>
                  {sendResult.preview && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Preview email
                      </summary>
                      <iframe
                        sandbox=""
                        srcDoc={sendResult.preview}
                        className="mt-2 border rounded bg-white w-full"
                        style={{ minHeight: 300 }}
                        title="Email preview"
                      />
                    </details>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRfqModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRfq}
                  disabled={sending || rfqProducts.every((p) => !p.name)}
                >
                  <Send className="mr-1 h-4 w-4" />
                  {sending ? "Sending..." : "Send RFQ"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
