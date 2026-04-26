import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  getKpis(@Request() req: AuthRequest) {
    return this.analyticsService.getKpiSummary(req.user.organizationId);
  }

  @Get('supplier-performance')
  getSupplierPerformance(@Request() req: AuthRequest) {
    return this.analyticsService.getSupplierPerformance(req.user.organizationId);
  }

  @Get('inventory-turnover')
  getInventoryTurnover(@Request() req: AuthRequest) {
    return this.analyticsService.getInventoryTurnover(req.user.organizationId);
  }

  @Get('cash-flow')
  getCashFlow(@Request() req: AuthRequest) {
    return this.analyticsService.getCashFlowTrends(req.user.organizationId);
  }

  @Get('export')
  async exportReport(
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    const [kpis, supplierPerf, inventoryTurnover, cashFlow] = await Promise.all([
      this.analyticsService.getKpiSummary(req.user.organizationId),
      this.analyticsService.getSupplierPerformance(req.user.organizationId),
      this.analyticsService.getInventoryTurnover(req.user.organizationId),
      this.analyticsService.getCashFlowTrends(req.user.organizationId),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      kpis,
      supplierPerformance: supplierPerf,
      inventoryTurnover,
      cashFlow,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="nexusflow-report-${new Date().toISOString().slice(0, 10)}.json"`,
    );
    res.send(JSON.stringify(report, null, 2));
  }
}
