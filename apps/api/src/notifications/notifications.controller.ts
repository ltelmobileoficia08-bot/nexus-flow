import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('status')
  getStatus() {
    return this.notificationsService.getStatus();
  }

  @Get('templates')
  getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Post('rfq')
  @Roles(Role.ADMIN, Role.MANAGER)
  sendRfq(
    @Request() req: AuthRequest,
    @Body()
    body: {
      supplierId: string;
      products: { name: string; quantity: number }[];
      notes?: string;
    },
  ) {
    return this.notificationsService.sendRfqEmail(
      req.user.organizationId,
      body.supplierId,
      body,
    );
  }

  @Post('order-confirmation')
  @Roles(Role.ADMIN, Role.MANAGER)
  sendOrderConfirmation(
    @Request() req: AuthRequest,
    @Body() body: { orderId: string },
  ) {
    return this.notificationsService.sendOrderConfirmation(
      req.user.organizationId,
      body.orderId,
    );
  }

  @Post('payment-reminder')
  @Roles(Role.ADMIN, Role.MANAGER)
  sendPaymentReminder(
    @Request() req: AuthRequest,
    @Body() body: { orderId: string },
  ) {
    return this.notificationsService.sendPaymentReminder(
      req.user.organizationId,
      body.orderId,
    );
  }
}
