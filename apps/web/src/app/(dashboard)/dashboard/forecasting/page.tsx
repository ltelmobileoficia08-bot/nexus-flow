"use client";

import { useEffect, useState } from "react";
import {
  getShopifyStatus,
  syncShopifyProducts,
  getShopifySalesTrends,
  type ShopifyStatus,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Package,
  Link2,
} from "lucide-react";

export default function ForecastingPage() {
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [trends, setTrends] = useState<{
    source: string;
    trends: { month: string; revenue: number; orders: number; units: number }[];
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    Promise.all([getShopifyStatus(token), getShopifySalesTrends(token)])
      .then(([s, t]) => {
        setStatus(s);
        setTrends(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    const token = localStorage.getItem("nexusflow_token");
    if (!token) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncShopifyProducts(token);
      setSyncResult(result.message);
    } catch (e) {
      setSyncResult(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const maxRevenue = trends
    ? Math.max(...trends.trends.map((t) => t.revenue), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shopify Integration</h1>
        <p className="text-muted-foreground mt-1">
          Connect your Shopify store for live product catalog and sales data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connection Status
            </CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={status?.configured ? "outline" : "secondary"}>
                {status?.configured ? "Connected" : "Not Configured"}
              </Badge>
            </div>
            {status?.storeUrl && (
              <p className="text-xs mt-2 text-muted-foreground">
                {status.storeUrl}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Source
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {trends?.source === "shopify" ? "Live Shopify" : "Local Database"}
            </Badge>
            <p className="text-xs mt-2 text-muted-foreground">
              {trends?.source === "shopify"
                ? "Real-time data from your store"
                : "Using purchase order data for analysis"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Product Sync
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Products"}
            </button>
            {syncResult && (
              <p className="text-xs mt-2 text-muted-foreground">{syncResult}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!status?.configured && (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Connect Your Shopify Store</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Set the following environment variables to enable live Shopify
                integration:
              </p>
              <div className="bg-muted rounded-lg p-4 text-left max-w-md mx-auto">
                <code className="text-xs">
                  SHOPIFY_STORE_URL=https://your-store.myshopify.com
                  <br />
                  SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Until configured, analytics use local purchase order data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales & Procurement Trends
          </CardTitle>
          <CardDescription>
            {trends?.source === "shopify"
              ? "Revenue trends from your Shopify store"
              : "Procurement volume from purchase orders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trends && trends.trends.length > 0 ? (
            <div className="space-y-3">
              {trends.trends.map((t) => (
                <div key={t.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium shrink-0">
                    {t.month}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded bg-primary transition-all"
                        style={{
                          width: `${(t.revenue / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right text-sm font-medium shrink-0">
                    ${t.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="w-24 text-right text-xs text-muted-foreground shrink-0">
                    {t.orders} orders &middot; {t.units} units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>No trend data available yet.</p>
              <p className="text-sm mt-1">
                Create purchase orders or connect Shopify to see trends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
