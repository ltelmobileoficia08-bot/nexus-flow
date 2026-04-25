"use client";

import { useEffect, useState } from "react";
import { getSuppliers, type Supplier } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, TrendingDown } from "lucide-react";

export default function NegotiationsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    getSuppliers(token).then(setSuppliers).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Loading negotiations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Negotiations</h1>
        <p className="text-muted-foreground">AI-powered supplier negotiation management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Negotiations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, s) => sum + (s.rating ?? 0), 0) / (suppliers.length || 1)).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Potential</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Negotiation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{supplier.email}</p>
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
                  <Badge variant={supplier._count && supplier._count.orders > 1 ? "default" : "secondary"}>
                    {supplier._count?.orders ?? 0} orders
                  </Badge>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="mr-1 h-3.5 w-3.5" />
                    Negotiate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
