require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = 'http://localhost:3002/api';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNextAPI() {
  try {
    console.log('Testing Next.js API routes...');

    // Create a session directly with Supabase
    console.log('\n1. Creating a session with Supabase...');
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          title: 'Test Session',
          mode: 'heliosynthesis'
        }
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return;
    }

    console.log('Session created:', session);
    const sessionId = session.id;

    // Test sessions endpoint
    console.log('\n2. Testing sessions endpoint...');
    try {
      const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
      const sessionsData = await sessionsResponse.json();
      console.log('Sessions response:', sessionsData);
    } catch (error) {
      console.error('Error testing sessions endpoint:', error);
    }

    // Test messages endpoint
    console.log('\n3. Testing messages endpoint...');
    try {
      const messagesResponse = await fetch(`${API_BASE_URL}/messages?sessionId=${sessionId}`);
      const messagesData = await messagesResponse.json();
      console.log('Messages response:', messagesData);
    } catch (error) {
      console.error('Error testing messages endpoint:', error);
    }

    // Test chat endpoint
    console.log('\n4. Testing chat endpoint...');
    try {
      const chatResponse = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, this is a test message',
          sessionId,
          mode: 'heliosynthesis'
        })
      });
      const chatData = await chatResponse.json();
      console.log('Chat response:', chatData);
    } catch (error) {
      console.error('Error testing chat endpoint:', error);
    }

    console.log('\nNext.js API test completed!');
  } catch (error) {
    console.error('Error testing Next.js API:', error);
  }
}

testNextAPI(); 