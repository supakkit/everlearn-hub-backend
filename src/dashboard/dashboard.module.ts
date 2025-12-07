import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [EnrollmentsModule, StatsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
