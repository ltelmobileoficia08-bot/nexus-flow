import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.ordersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Request() req: AuthRequest,
    @Body()
    body: {
      supplierId: string;
      notes?: string;
      items: { productId: string; quantity: number; unitPrice: number }[];
    },
  ) {
    return this.ordersService.create(req.user.organizationId, body);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
