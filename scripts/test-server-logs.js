require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = 'http://localhost:3002/api';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServerLogs() {
  try {
    console.log('Testing server logs...');

    // Test sessions endpoint with detailed error handling
    console.log('\n1. Testing sessions endpoint with detailed error handling...');
    try {
      const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
      console.log('Sessions response status:', sessionsResponse.status);
      console.log('Sessions response headers:', sessionsResponse.headers);
      
      const sessionsData = await sessionsResponse.json();
      console.log('Sessions response data:', sessionsData);
    } catch (error) {
      console.error('Error testing sessions endpoint:', error);
    }

    // Test sessions endpoint directly with Supabase
    console.log('\n2. Testing sessions endpoint directly with Supabase...');
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
      } else {
        console.log('Sessions data:', sessions);
      }
    } catch (error) {
      console.error('Error testing sessions endpoint directly:', error);
    }

    // Test POST sessions endpoint
    console.log('\n3. Testing POST sessions endpoint...');
    try {
      const createSessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'heliosynthesis' })
      });
      console.log('Create session response status:', createSessionResponse.status);
      
      const createSessionData = await createSessionResponse.json();
      console.log('Create session response data:', createSessionData);
    } catch (error) {
      console.error('Error testing POST sessions endpoint:', error);
    }

    console.log('\nServer logs test completed!');
  } catch (error) {
    console.error('Error testing server logs:', error);
  }
}

testServerLogs(); 