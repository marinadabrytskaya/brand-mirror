# BrandMirror

BrandMirror is a standalone product by SAHAR Studio.

It is positioned as an AI-powered brand positioning and visual identity audit
for founders, premium service brands, small creative studios, and agencies.
The product should feel like a real diagnostic tool with future app potential,
not a generic SaaS site and not an agency service page.

## Current Scope

- Standalone landing page
- Sample report / analysis preview
- Product-facing structure for future app routes
- Offer and MVP notes in `docs/brandmirror-foundation.md`

## Routes

- `/` landing page
- `/sample-report` sample diagnostic output

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Promo Codes

Promo codes are configured with `PROMO_CODES`:

```bash
PROMO_CODES="PARTNER100:100,BD30:30"
```

`100` opens the paid report with a signed promo unlock token. Lower percentages
apply a Paystack discount before checkout.

## Product Direction

Core tagline: `See what your brand is actually saying.`

Primary CTA: `Read my brand`

Secondary CTA: `See sample report`

Preferred domain direction: `brandmirror.app`
