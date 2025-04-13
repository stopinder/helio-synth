'use client';

import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        // Test the Supabase connection by fetching a single row from the sessions table
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
          return;
        }

        // If we get here, the connection was successful
        setConnectionStatus('success');
        setData(data);
      } catch (error) {
        console.error('Unexpected error testing Supabase connection:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Supabase Connection Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
          <div className={`p-3 rounded-md ${
            connectionStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'loading' ? 'Checking connection...' :
             connectionStatus === 'success' ? 'Connected successfully!' :
             'Connection failed'}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Error:</h2>
            <div className="p-3 bg-red-100 text-red-800 rounded-md">
              {errorMessage}
            </div>
          </div>
        )}

        {data && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Data:</h2>
            <div className="p-3 bg-gray-100 rounded-md overflow-auto max-h-60">
              <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">API Endpoints:</h2>
          <ul className="space-y-2">
            <li>
              <a 
                href="/api/test-supabase" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                /api/test-supabase
              </a>
              <span className="text-gray-500 ml-2">- Basic connection test</span>
            </li>
            <li>
              <a 
                href="/api/test-supabase-tables" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                /api/test-supabase-tables
              </a>
              <span className="text-gray-500 ml-2">- Test both tables</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 