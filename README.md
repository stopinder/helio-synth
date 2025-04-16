# Helio Synth Chat

A modern chat interface with multiple prompt modes powered by OpenAI.

## Features

- Three distinct prompt modes: Heliosynthesis, Plain, and Mythic
- Modern, responsive UI with message bubbles
- Real-time loading animations
- Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js 18.x or later
- An OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Prompt Modes

- **Heliosynthesis**: Creative synthesis and innovative thinking
- **Plain**: Clear, concise, and direct responses
- **Mythic**: Storytelling, mythology, and deeper meaning

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- OpenAI API

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log(metric);
  }
}

const accessibilityConfig = {
  colorContrast: {
    primary: '#4F46E5',
    secondary: '#818CF8',
    text: '#1F2937'
  },
  keyboardNavigation: true,
  screenReaderSupport: true
};

export const metadata = {
  title: 'Helio Chat',
  description: 'A poetic chat interface for inner exploration',
  openGraph: {
    title: 'Helio Chat',
    description: 'A poetic chat interface for inner exploration',
    type: 'website',
    locale: 'en_US',
    site_name: 'Helio Chat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Helio Chat',
    description: 'A poetic chat interface for inner exploration',
  },
};

// Add error boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Error:', error, errorInfo);
  }
  // ... rest of implementation
}

// Add test setup
const testConfig = {
  jest: {
    setupFiles: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    collectCoverage: true
  },
  cypress: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720
  }
};
