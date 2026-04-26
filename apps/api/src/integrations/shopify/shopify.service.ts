import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface ShopifyProduct {
  id: number;
  title: string;
  variants: {
    id: number;
    sku: string;
    price: string;
    inventory_quantity: number;
  }[];
}

interface ShopifyOrder {
  id: number;
  name: string;
  total_price: string;
  created_at: string;
  line_items: {
    product_id: number;
    quantity: number;
    price: string;
    sku: string;
  }[];
}

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);
  private readonly shopUrl: string | undefined;
  private readonly accessToken: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.shopUrl = this.config.get<string>('SHOPIFY_STORE_URL');
    this.accessToken = this.config.get<string>('SHOPIFY_ACCESS_TOKEN');
  }

  isConfigured(): boolean {
    return !!this.shopUrl && !!this.accessToken;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      storeUrl: this.shopUrl ? `${this.shopUrl.replace(/https?:\/\//, '').split('.')[0]}.myshopify.com` : null,
    };
  }

  private async shopifyFetch<T>(endpoint: string): Promise<T> {
    if (!this.shopUrl || !this.accessToken) {
      throw new Error('Shopify not configured');
    }

    const url = `${this.shopUrl}/admin/api/2024-01${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async fetchProducts(): Promise<ShopifyProduct[]> {
    const data = await this.shopifyFetch<{ products: ShopifyProduct[] }>(
      '/products.json?limit=250',
    );
    return data.products;
  }

  async fetchOrders(): Promise<ShopifyOrder[]> {
    const data = await this.shopifyFetch<{ orders: ShopifyOrder[] }>(
      '/orders.json?limit=250&status=any',
    );
    return data.orders;
  }

  async syncProducts(organizationId: string) {
    if (!this.isConfigured()) {
      return { synced: 0, message: 'Shopify not configured. Set SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN.' };
    }

    try {
      const shopifyProducts = await this.fetchProducts();
      let synced = 0;

      for (const sp of shopifyProducts) {
        for (const variant of sp.variants) {
          if (!variant.sku) continue;

          const existing = await this.prisma.product.findFirst({
            where: { sku: variant.sku, organizationId },
          });

          if (existing) {
            await this.prisma.product.update({
              where: { id: existing.id },
              data: {
                name: sp.title,
                currentStock: variant.inventory_quantity,
                unitCost: parseFloat(variant.price),
              },
            });
          } else {
            await this.prisma.product.create({
              data: {
                sku: variant.sku,
                name: sp.title,
                currentStock: variant.inventory_quantity,
                unitCost: parseFloat(variant.price),
                reorderPoint: Math.max(10, Math.floor(variant.inventory_quantity * 0.2)),
                safetyStock: Math.max(5, Math.floor(variant.inventory_quantity * 0.1)),
                organizationId,
              },
            });
          }
          synced++;
        }
      }

      this.logger.log(`Synced ${synced} products from Shopify`);
      return { synced, message: `Successfully synced ${synced} products from Shopify` };
    } catch (error) {
      this.logger.error('Shopify product sync failed', error);
      throw error;
    }
  }

  async getSalesTrends(organizationId: string) {
    if (!this.isConfigured()) {
      return this.getDemoSalesTrends(organizationId);
    }

    try {
      const orders = await this.fetchOrders();
      const monthlyData: Record<string, { month: string; revenue: number; orders: number; units: number }> = {};

      for (const order of orders) {
        const month = order.created_at.slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { month, revenue: 0, orders: 0, units: 0 };
        }
        monthlyData[month].revenue += parseFloat(order.total_price);
        monthlyData[month].orders += 1;
        monthlyData[month].units += order.line_items.reduce((s, i) => s + i.quantity, 0);
      }

      return {
        source: 'shopify',
        trends: Object.values(monthlyData),
      };
    } catch {
      return this.getDemoSalesTrends(organizationId);
    }
  }

  private async getDemoSalesTrends(organizationId: string) {
    const orders = await this.prisma.order.findMany({
      where: { organizationId },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyData: Record<string, { month: string; revenue: number; orders: number; units: number }> = {};

    for (const order of orders) {
      const month = order.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, orders: 0, units: 0 };
      }
      monthlyData[month].revenue += order.totalAmount;
      monthlyData[month].orders += 1;
      monthlyData[month].units += order.items.reduce((s, i) => s + i.quantity, 0);
    }

    return {
      source: 'database',
      trends: Object.values(monthlyData),
    };
  }
}
