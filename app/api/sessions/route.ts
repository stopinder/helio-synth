import { NextResponse } from 'next/server';
import supabase from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, title, mode, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { mode } = await req.json();
    
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([
        { 
          mode,
          title: `Session ${new Date().toLocaleString()}`
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 