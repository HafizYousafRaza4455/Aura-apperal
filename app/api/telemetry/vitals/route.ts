import { NextRequest, NextResponse } from 'next/server';

export interface WebVitalMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  navigationType?: string;
}

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

export async function POST(req: NextRequest) {
  try {
    const metric: WebVitalMetric = await req.json();

    if (!metric || !metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid web vitals payload' },
        { status: 400 }
      );
    }

    const threshold = THRESHOLDS[metric.name];
    let computedRating: 'good' | 'needs-improvement' | 'poor' = 'good';

    if (threshold) {
      if (metric.value > threshold.poor) {
        computedRating = 'poor';
      } else if (metric.value > threshold.good) {
        computedRating = 'needs-improvement';
      }
    }

    // In production, forward to Datadog/Cloudwatch/OpenTelemetry
    if (computedRating === 'poor') {
      console.warn(`[AURA PERFORMANCE ALERT] High ${metric.name}: ${metric.value.toFixed(2)} (${computedRating})`);
    }

    return NextResponse.json({
      received: true,
      metric: metric.name,
      value: metric.value,
      rating: computedRating,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Telemetry ingestion failed', message: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Aura Performance Telemetry Beacon',
    supportedMetrics: Object.keys(THRESHOLDS),
  });
}
