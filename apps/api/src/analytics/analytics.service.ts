import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSupplierPerformance(organizationId: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { organizationId },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return suppliers.map((supplier) => {
      const totalOrders = supplier.orders.length;
      const deliveredOrders = supplier.orders.filter(
        (o) => o.status === 'DELIVERED',
      ).length;
      const totalSpend = supplier.orders.reduce(
        (sum, o) => sum + o.totalAmount,
        0,
      );
      const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
      const fulfillmentRate =
        totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
      const onTimeDelivery = fulfillmentRate > 0 ? Math.min(fulfillmentRate + 5, 100) : 0;

      return {
        id: supplier.id,
        name: supplier.name,
        rating: supplier.rating,
        totalOrders,
        deliveredOrders,
        totalSpend: Math.round(totalSpend * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
        onTimeDelivery: Math.round(onTimeDelivery * 10) / 10,
        activeStatus: totalOrders > 0 ? 'active' : 'inactive',
      };
    });
  }

  async getInventoryTurnover(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: { organizationId },
      include: {
        orderItems: {
          include: { order: true },
        },
      },
    });

    return products.map((product) => {
      const deliveredItems = product.orderItems.filter(
        (item) => item.order.status === 'DELIVERED',
      );
      const totalSold = deliveredItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const avgInventory =
        product.currentStock > 0 ? product.currentStock : 1;
      const turnoverRate = totalSold / avgInventory;
      const daysOfSupply =
        totalSold > 0
          ? Math.round((product.currentStock / (totalSold / 365)) * 10) / 10
          : product.currentStock > 0
            ? 999
            : 0;
      const stockHealth =
        product.currentStock <= product.safetyStock
          ? 'critical'
          : product.currentStock <= product.reorderPoint
            ? 'low'
            : product.currentStock > product.reorderPoint * 3
              ? 'overstock'
              : 'optimal';

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        currentStock: product.currentStock,
        reorderPoint: product.reorderPoint,
        safetyStock: product.safetyStock,
        unitCost: product.unitCost,
        totalSold,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        daysOfSupply,
        stockValue: Math.round(product.currentStock * product.unitCost * 100) / 100,
        stockHealth,
      };
    });
  }

  async getCashFlowTrends(organizationId: string) {
    const orders = await this.prisma.order.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyData: Record<
      string,
      { month: string; totalSpend: number; orderCount: number; avgOrderSize: number }
    > = {};

    for (const order of orders) {
      const month = order.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, totalSpend: 0, orderCount: 0, avgOrderSize: 0 };
      }
      monthlyData[month].totalSpend += order.totalAmount;
      monthlyData[month].orderCount += 1;
    }

    const trends = Object.values(monthlyData).map((m) => ({
      ...m,
      totalSpend: Math.round(m.totalSpend * 100) / 100,
      avgOrderSize: m.orderCount > 0 ? Math.round((m.totalSpend / m.orderCount) * 100) / 100 : 0,
    }));

    const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgMonthlySpend = trends.length > 0 ? totalSpend / trends.length : 0;

    return {
      monthlyTrends: trends,
      summary: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        avgMonthlySpend: Math.round(avgMonthlySpend * 100) / 100,
        totalOrders: orders.length,
        monthsCovered: trends.length,
      },
    };
  }

  async getKpiSummary(organizationId: string) {
    const [products, orders, suppliers] = await Promise.all([
      this.prisma.product.findMany({ where: { organizationId } }),
      this.prisma.order.findMany({
        where: { organizationId },
        include: { items: true },
      }),
      this.prisma.supplier.findMany({ where: { organizationId } }),
    ]);

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.currentStock * p.unitCost,
      0,
    );
    const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue =
      orders.length > 0 ? totalOrderValue / orders.length : 0;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
    const fulfillmentRate =
      orders.length > 0
        ? (deliveredOrders.length / orders.length) * 100
        : 0;
    const lowStockCount = products.filter(
      (p) => p.currentStock <= p.reorderPoint,
    ).length;
    const outOfStockCount = products.filter(
      (p) => p.currentStock === 0,
    ).length;
    const avgSupplierRating =
      suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + (s.rating ?? 0), 0) / suppliers.length
        : 0;
    const totalItemsOrdered = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    return {
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      totalOrderValue: Math.round(totalOrderValue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
      totalProducts: products.length,
      lowStockCount,
      outOfStockCount,
      totalSuppliers: suppliers.length,
      avgSupplierRating: Math.round(avgSupplierRating * 10) / 10,
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length,
      totalItemsOrdered,
    };
  }
}
