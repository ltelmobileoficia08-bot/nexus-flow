import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(organizationId: string) {
    const [products, orders, suppliers] = await Promise.all([
      this.prisma.product.findMany({ where: { organizationId } }),
      this.prisma.order.findMany({ where: { organizationId } }),
      this.prisma.supplier.findMany({ where: { organizationId } }),
    ]);

    const inventoryValue = products.reduce(
      (sum, p) => sum + p.currentStock * p.unitCost,
      0,
    );

    const pendingOrders = orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'CONFIRMED',
    ).length;

    const totalOrders = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockProducts = products.filter(
      (p) => p.currentStock <= p.reorderPoint,
    );
    const overstockProducts = products.filter(
      (p) => p.currentStock > p.reorderPoint * 3,
    );
    const optimalProducts = products.filter(
      (p) =>
        p.currentStock > p.reorderPoint && p.currentStock <= p.reorderPoint * 3,
    );

    const alerts = [
      ...lowStockProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        type:
          p.currentStock <= p.safetyStock
            ? ('critical' as const)
            : ('low_stock' as const),
        message:
          p.currentStock <= p.safetyStock
            ? `${p.sku} (${p.name}) below safety stock`
            : `${p.sku} (${p.name}) below reorder point`,
        currentStock: p.currentStock,
        reorderPoint: p.reorderPoint,
        safetyStock: p.safetyStock,
      })),
      ...overstockProducts.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        type: 'overstock' as const,
        message: `${p.sku} (${p.name}) overstock detected`,
        currentStock: p.currentStock,
        reorderPoint: p.reorderPoint,
        safetyStock: p.safetyStock,
      })),
      ...optimalProducts.slice(0, 2).map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        type: 'optimal' as const,
        message: `${p.sku} (${p.name}) inventory at optimal level`,
        currentStock: p.currentStock,
        reorderPoint: p.reorderPoint,
        safetyStock: p.safetyStock,
      })),
    ];

    return {
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      pendingOrders,
      totalOrders: orders.length,
      activeSuppliers: suppliers.length,
      totalOrderValue: Math.round(totalOrders * 100) / 100,
      productCount: products.length,
      alerts,
    };
  }
}
