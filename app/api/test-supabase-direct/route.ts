import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://rczpofxgpeanxnztipav.supabase.co';
const supabaseAnonKey = 'YOUR_ACTUAL_ANON_KEY_HERE'; // Replace with your actual anon key

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Test the Supabase connection by fetching a single row from the sessions table
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Failed to connect to Supabase',
          error: error.message
        },
        { status: 500 }
      );
    }

    // If we get here, the connection was successful
    return NextResponse.json(
      { 
        status: 'success', 
        message: 'Successfully connected to Supabase',
        data: data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Unexpected error testing Supabase connection',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 