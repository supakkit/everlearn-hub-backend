import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StripeProvider } from './stripe.provider';
import { STRIPE } from './constants';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [StripeWebhookController],
  providers: [StripeProvider, StripeService],
  exports: [STRIPE],
})
export class StripeModule {}
