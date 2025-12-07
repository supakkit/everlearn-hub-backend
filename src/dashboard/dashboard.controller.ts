import {
  Controller,
  Get,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { DashboardResponse } from './responses/dashboard.response';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: DashboardResponse })
  async findOne(@Request() req: AuthRequest) {
    const dashboard = await this.dashboardService.findOne(req.user.sub);
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return new DashboardResponse(dashboard);
  }
}
