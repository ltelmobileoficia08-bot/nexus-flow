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
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface AuthRequest {
  user: { id: string; organizationId: string };
}

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.suppliersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Request() req: AuthRequest,
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      rating?: number;
    },
  ) {
    return this.suppliersService.create(req.user.organizationId, body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      rating?: number;
    },
  ) {
    return this.suppliersService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
