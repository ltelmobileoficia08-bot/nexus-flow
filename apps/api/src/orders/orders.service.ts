import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
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

  async findOne(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
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
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: data.supplierId, organizationId },
    });
    if (!supplier) throw new BadRequestException('Supplier not found in your organization');

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, organizationId },
      select: { id: true },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found in your organization');
    }

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const suffix = randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `PO-${new Date().getFullYear()}-${suffix}`;

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

  async updateStatus(id: string, organizationId: string, status: OrderStatus) {
    const order = await this.prisma.order.findFirst({ where: { id, organizationId } });
    if (!order) throw new NotFoundException('Order not found');
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

  async remove(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, organizationId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });
    return { deleted: true };
  }
}
