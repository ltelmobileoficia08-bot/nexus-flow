import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.order.findMany({
      where: { organizationId },
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, sku: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(
    organizationId: string,
    data: {
      supplierId: string;
      notes?: string;
      items: { productId: string; quantity: number; unitPrice: number }[];
    },
  ) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const count = await this.prisma.order.count({ where: { organizationId } });
    const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        notes: data.notes,
        organizationId,
        supplierId: data.supplierId,
        items: { create: data.items },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, sku: true, name: true } } },
        },
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, sku: true, name: true } } },
        },
      },
    });
  }

  async remove(id: string) {
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    await this.prisma.order.delete({ where: { id } });
    return { deleted: true };
  }
}
