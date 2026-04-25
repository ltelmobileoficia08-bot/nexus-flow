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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.productsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Request() req: AuthRequest,
    @Body()
    body: {
      sku: string;
      name: string;
      description?: string;
      currentStock?: number;
      reorderPoint?: number;
      safetyStock?: number;
      unitCost?: number;
    },
  ) {
    return this.productsService.create(req.user.organizationId, body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      currentStock?: number;
      reorderPoint?: number;
      safetyStock?: number;
      unitCost?: number;
    },
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
