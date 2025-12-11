import { ConfigService } from '@nestjs/config';
import { STRIPE } from './constants';
import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const StripeProvider: Provider = {
  provide: STRIPE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const STRIPE_SECRET_KEY =
      configService.get<string>('STRIPE_SECRET_KEY') || '';
    return new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  },
};
