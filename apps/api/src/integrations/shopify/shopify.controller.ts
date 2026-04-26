import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('integrations/shopify')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Get('status')
  getStatus() {
    return this.shopifyService.getStatus();
  }

  @Post('sync-products')
  @Roles(Role.ADMIN, Role.MANAGER)
  syncProducts(@Request() req: AuthRequest) {
    return this.shopifyService.syncProducts(req.user.organizationId);
  }

  @Get('sales-trends')
  getSalesTrends(@Request() req: AuthRequest) {
    return this.shopifyService.getSalesTrends(req.user.organizationId);
  }
}
