import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { metrics, timestamp, url, userAgent } = data;

    // Store performance metrics in Supabase
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metrics,
        timestamp,
        url,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing performance metrics:', error);
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in performance endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 