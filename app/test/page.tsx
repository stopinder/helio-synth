'use client';

import { useState } from 'react';

export default function TestPage() {
  const [getResult, setGetResult] = useState<string>('');
  const [postResult, setPostResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testGetApi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test');
      const data = await response.json();
      setGetResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setGetResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPostApi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });
      const data = await response.json();
      setPostResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setPostResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testChatApi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Hello, this is a test message',
          mode: 'heliosynthesis',
          sessionId: null
        }),
      });
      const data = await response.json();
      setPostResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setPostResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test GET API</h2>
        <button 
          onClick={testGetApi}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-2"
        >
          Test GET /api/test
        </button>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {getResult || 'No result yet'}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test POST API</h2>
        <button 
          onClick={testPostApi}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-2"
        >
          Test POST /api/test
        </button>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {postResult || 'No result yet'}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Chat API</h2>
        <button 
          onClick={testChatApi}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded mb-2"
        >
          Test POST /api/chat
        </button>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {postResult || 'No result yet'}
        </pre>
      </div>
      
      {loading && <p className="text-gray-500">Loading...</p>}
    </div>
  );
} 