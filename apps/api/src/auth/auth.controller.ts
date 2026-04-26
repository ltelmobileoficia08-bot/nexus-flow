import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type Res = Response;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Res,
  ) {
    const result = await this.authService.register(dto);
    res.cookie('nexusflow_token', result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Res,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('nexusflow_token', result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: { id: string } }) {
    return this.authService.validateUser(req.user.id);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Res) {
    res.clearCookie('nexusflow_token', { path: '/' });
    return { message: 'Logged out' };
  }
}
