import Stripe from 'stripe'
import type { PricingTier } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

export const PRICING_TIERS: PricingTier[] = [
  {
    id:            'free',
    name:          'Free',
    price_monthly: 0,
    price_yearly:  0,
    description:   'Everything you need to start building with AI prompts.',
    features: [
      'Up to 25 saved prompts',
      '10 AI enhancements/month',
      'Prompt Score Engine',
      '3 versions per prompt',
      'Community templates',
      'Basic analytics',
    ],
    limits: {
      prompts:               25,
      enhancements_per_month: 10,
      versions_per_prompt:    3,
      team_members:           1,
    },
  },
  {
    id:            'pro',
    name:          'Pro',
    price_monthly: 19,
    price_yearly:  190,
    description:   'For serious prompt engineers and power users.',
    badge:         'Most Popular',
    highlighted:   true,
    features: [
      'Unlimited saved prompts',
      'Unlimited AI enhancements',
      'Advanced Score Engine',
      'Unlimited version history',
      'Priority AI processing',
      'Export (JSON, Markdown)',
      'API access (coming soon)',
      'Advanced analytics',
    ],
    limits: {
      prompts:               'unlimited',
      enhancements_per_month: 'unlimited',
      versions_per_prompt:    'unlimited',
      team_members:           1,
    },
  },
  {
    id:            'team',
    name:          'Team',
    price_monthly: 49,
    price_yearly:  490,
    description:   'Collaborate and scale across your entire team.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared prompt vault',
      'Team analytics dashboard',
      'Role-based permissions',
      'SSO / SAML (coming soon)',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      prompts:               'unlimited',
      enhancements_per_month: 'unlimited',
      versions_per_prompt:    'unlimited',
      team_members:           10,
    },
  },
]

// Stripe Price IDs — set these after creating products in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  pro_monthly:  process.env.STRIPE_PRO_MONTHLY_PRICE_ID  ?? '',
  pro_yearly:   process.env.STRIPE_PRO_YEARLY_PRICE_ID   ?? '',
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? '',
  team_yearly:  process.env.STRIPE_TEAM_YEARLY_PRICE_ID  ?? '',
} as const
