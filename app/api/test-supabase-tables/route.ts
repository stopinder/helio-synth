import { NextResponse } from 'next/server';
import supabase from '../../../lib/supabase';

export async function GET() {
  try {
    // Test the sessions table
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('Error accessing sessions table:', sessionsError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Failed to access sessions table',
          error: sessionsError.message
        },
        { status: 500 }
      );
    }

    // Test the messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('Error accessing messages table:', messagesError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Failed to access messages table',
          error: messagesError.message
        },
        { status: 500 }
      );
    }

    // If we get here, both tables are accessible
    return NextResponse.json(
      { 
        status: 'success', 
        message: 'Successfully connected to Supabase and accessed both tables',
        sessions: {
          count: sessionsData?.length || 0,
          sample: sessionsData?.[0] || null
        },
        messages: {
          count: messagesData?.length || 0,
          sample: messagesData?.[0] || null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error testing Supabase tables:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Unexpected error testing Supabase tables',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 