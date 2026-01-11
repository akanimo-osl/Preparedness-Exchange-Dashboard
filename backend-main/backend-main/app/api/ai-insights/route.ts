import { NextRequest, NextResponse } from 'next/server';
import { runTrigger } from '@/lib/moscripts';

/**
 * AI Insights API Route
 * 
 * Triggers MoScripts based on event type and input data.
 * Returns aggregated AI responses from multiple specialized models.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, data } = body;

    if (!trigger || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: trigger, data' },
        { status: 400 }
      );
    }

    // Execute all registered MoScripts for this trigger
    const insights = await runTrigger(trigger, data);

    return NextResponse.json({
      success: true,
      trigger,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
