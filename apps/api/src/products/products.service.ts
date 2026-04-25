import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: { include: { order: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(
    organizationId: string,
    data: {
      sku: string;
      name: string;
      description?: string;
      currentStock?: number;
      reorderPoint?: number;
      safetyStock?: number;
      unitCost?: number;
    },
  ) {
    return this.prisma.product.create({
      data: { ...data, organizationId },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      currentStock?: number;
      reorderPoint?: number;
      safetyStock?: number;
      unitCost?: number;
    },
  ) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}
