import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.supplier.findMany({
      where: { organizationId },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId },
      include: { orders: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(
    organizationId: string,
    data: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      rating?: number;
    },
  ) {
    return this.prisma.supplier.create({
      data: { ...data, organizationId },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      rating?: number;
    },
  ) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id, organizationId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async remove(id: string, organizationId: string) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id, organizationId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    await this.prisma.supplier.delete({ where: { id } });
    return { deleted: true };
  }
}
