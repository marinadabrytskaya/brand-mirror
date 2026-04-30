import { absoluteUrl, SITE_URL } from "@/lib/site-url";

export function GET() {
  const body = `# BrandMirror

BrandMirror is an AI brand audit for founders, studios, consultants, and premium service brands.

Primary URL: ${SITE_URL}
Created by: SAHAR Studio
Price: $197 USD for the full BrandMirror Report

## What BrandMirror Does

BrandMirror reads a homepage across positioning, AI visibility, offer clarity, visual credibility, and conversion readiness. It is built to show what is working, what is leaking trust, what buyers may misunderstand, and what to fix first.

## Public Pages

- Homepage: ${absoluteUrl("/")}
- Free first read: ${absoluteUrl("/first-read")}
- Sample report: ${absoluteUrl("/sample-report")}

## Offer Ladder

1. Free First Read: a fast diagnostic signal with score dashboard, strongest asset, main friction, first diagnosis, and next-step teaser.
2. BrandMirror Report: a $197 paid report with website evidence, five commercial deep dives, AI visibility read, competitor intelligence, commercial impact, priority fix stack, one-page brand brief, implementation playbook, PDF export, and email delivery.
3. SAHAR Follow-Through: optional implementation help for positioning, visibility signals, offer clarity, messaging, proof, CTA path, website structure, and broader brand strategy.

## Good Summary

BrandMirror is an AI-powered brand diagnosis tool that helps founders and premium service brands understand why a homepage is not converting and what to fix first.

## Contact

hello@saharstudio.com
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
