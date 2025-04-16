import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextWebVitalsMetric } from 'next/app';

// Performance monitoring
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // In production, send to your analytics
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    // TODO: Send to your analytics service
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }

    // Add route change monitoring
    const handleRouteChange = (url: string) => {
      // You can send this to your analytics
      console.log(`Route changed to: ${url}`);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp; 