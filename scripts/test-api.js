require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3002/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');

    // Test sessions endpoint
    console.log('\n1. Testing sessions endpoint...');
    const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`);
    const sessionsData = await sessionsResponse.json();
    console.log('Sessions response:', sessionsData);

    // Create a new session
    console.log('\n2. Creating a new session...');
    const createSessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'heliosynthesis' })
    });
    const createSessionData = await createSessionResponse.json();
    console.log('Create session response:', createSessionData);

    if (!createSessionData.sessionId) {
      console.error('Failed to create session');
      return;
    }

    const sessionId = createSessionData.sessionId;

    // Test messages endpoint
    console.log('\n3. Testing messages endpoint...');
    const messagesResponse = await fetch(`${API_BASE_URL}/messages?sessionId=${sessionId}`);
    const messagesData = await messagesResponse.json();
    console.log('Messages response:', messagesData);

    // Test chat endpoint
    console.log('\n4. Testing chat endpoint...');
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

    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 