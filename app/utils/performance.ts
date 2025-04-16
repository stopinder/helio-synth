import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Performance thresholds and budgets
const PERFORMANCE_THRESHOLDS = {
  FCP: 1800, // First Contentful Paint (ms)
  LCP: 2500, // Largest Contentful Paint (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTI: 3800, // Time to Interactive (ms)
  TBT: 300,  // Total Blocking Time (ms)
  FID: 100,  // First Input Delay (ms)
  INP: 200,  // Interaction to Next Paint (ms)
};

// Performance regression detection
const REGRESSION_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  threshold: 0.2, // 20% degradation threshold
  windowSize: 10, // Number of samples to consider
  alertFrequency: 'daily', // How often to send alerts
};

// Performance budgets
const PERFORMANCE_BUDGETS = {
  bundleSize: {
    js: 170 * 1024, // 170KB
    css: 50 * 1024, // 50KB
    images: 100 * 1024, // 100KB
  },
  resourceCount: {
    scripts: 10,
    stylesheets: 5,
    images: 20,
  },
  thirdParty: {
    maxRequests: 15,
    maxSize: 500 * 1024, // 500KB
  },
};

// Performance metrics collection
const collectMetrics = async () => {
  try {
    // Core Web Vitals
    const vitals = await getCoreWebVitals();
    
    // Resource timing
    const resources = getResourceTiming();
    
    // Memory usage
    const memory = await getMemoryUsage();
    
    // DOM metrics
    const dom = getDOMMetrics();
    
    // Performance budgets
    const budgets = checkPerformanceBudgets();
    
    // Regression detection
    const regressions = await detectRegressions(vitals);
    
    return {
      ...vitals,
      resources,
      memory,
      dom,
      budgets,
      regressions,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return null;
  }
};

// Performance budget checking
const checkPerformanceBudgets = () => {
  const budgets = {
    bundleSize: {
      js: 0,
      css: 0,
      images: 0,
      exceeded: false,
    },
    resourceCount: {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      exceeded: false,
    },
    thirdParty: {
      requests: 0,
      size: 0,
      exceeded: false,
    },
  };

  // Check bundle sizes
  const entries = performance.getEntriesByType('resource');
  entries.forEach(entry => {
    const size = entry.transferSize || entry.encodedBodySize || 0;
    if (entry.name.endsWith('.js')) {
      budgets.bundleSize.js += size;
    } else if (entry.name.endsWith('.css')) {
      budgets.bundleSize.css += size;
    } else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      budgets.bundleSize.images += size;
    }
  });

  // Check resource counts
  budgets.resourceCount.scripts = document.scripts.length;
  budgets.resourceCount.stylesheets = document.styleSheets.length;
  budgets.resourceCount.images = document.images.length;

  // Check third-party resources
  entries.forEach(entry => {
    if (!entry.name.includes(window.location.origin)) {
      budgets.thirdParty.requests++;
      budgets.thirdParty.size += entry.transferSize || entry.encodedBodySize || 0;
    }
  });

  // Check if budgets are exceeded
  budgets.bundleSize.exceeded = 
    budgets.bundleSize.js > PERFORMANCE_BUDGETS.bundleSize.js ||
    budgets.bundleSize.css > PERFORMANCE_BUDGETS.bundleSize.css ||
    budgets.bundleSize.images > PERFORMANCE_BUDGETS.bundleSize.images;

  budgets.resourceCount.exceeded =
    budgets.resourceCount.scripts > PERFORMANCE_BUDGETS.resourceCount.scripts ||
    budgets.resourceCount.stylesheets > PERFORMANCE_BUDGETS.resourceCount.stylesheets ||
    budgets.resourceCount.images > PERFORMANCE_BUDGETS.resourceCount.images;

  budgets.thirdParty.exceeded =
    budgets.thirdParty.requests > PERFORMANCE_BUDGETS.thirdParty.maxRequests ||
    budgets.thirdParty.size > PERFORMANCE_BUDGETS.thirdParty.maxSize;

  return budgets;
};

// Regression detection
const detectRegressions = async (currentMetrics: any) => {
  if (!REGRESSION_CONFIG.enabled) return null;

  try {
    // Get historical metrics from Supabase
    const { data: historicalMetrics, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(REGRESSION_CONFIG.windowSize);

    if (error || !historicalMetrics?.length) return null;

    const regressions = {
      detected: false,
      metrics: {} as Record<string, { current: number; previous: number; degradation: number }>,
    };

    // Calculate average of historical metrics
    const averages = historicalMetrics.reduce((acc, metric) => {
      Object.keys(PERFORMANCE_THRESHOLDS).forEach(key => {
        if (!acc[key]) acc[key] = 0;
        acc[key] += metric[key] || 0;
      });
      return acc;
    }, {} as Record<string, number>);

    Object.keys(averages).forEach(key => {
      averages[key] /= historicalMetrics.length;
    });

    // Check for regressions
    Object.keys(PERFORMANCE_THRESHOLDS).forEach(key => {
      const current = currentMetrics[key];
      const previous = averages[key];
      
      if (current && previous) {
        const degradation = (current - previous) / previous;
        if (degradation > REGRESSION_CONFIG.threshold) {
          regressions.detected = true;
          regressions.metrics[key] = {
            current,
            previous,
            degradation,
          };
        }
      }
    });

    return regressions;
  } catch (error) {
    console.error('Error detecting regressions:', error);
    return null;
  }
};

// Enhanced alerting
const alertOnPoorPerformance = (metrics: any) => {
  if (!ALERT_CONFIG.enabled) return;

  // Check thresholds
  Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, threshold]) => {
    if (metrics[metric] > threshold) {
      toast.warning(
        `${metric} exceeded threshold: ${metrics[metric]}ms (threshold: ${threshold}ms)`,
        {
          duration: ALERT_CONFIG.toastDuration,
          position: ALERT_CONFIG.toastPosition,
        }
      );
    }
  });

  // Check budgets
  if (metrics.budgets) {
    if (metrics.budgets.bundleSize.exceeded) {
      toast.warning('Bundle size budget exceeded', {
        duration: ALERT_CONFIG.toastDuration,
        position: ALERT_CONFIG.toastPosition,
      });
    }
    if (metrics.budgets.resourceCount.exceeded) {
      toast.warning('Resource count budget exceeded', {
        duration: ALERT_CONFIG.toastDuration,
        position: ALERT_CONFIG.toastPosition,
      });
    }
    if (metrics.budgets.thirdParty.exceeded) {
      toast.warning('Third-party resource budget exceeded', {
        duration: ALERT_CONFIG.toastDuration,
        position: ALERT_CONFIG.toastPosition,
      });
    }
  }

  // Check regressions
  if (metrics.regressions?.detected) {
    Object.entries(metrics.regressions.metrics).forEach(([metric, data]) => {
      toast.error(
        `Performance regression detected in ${metric}: ${(data.degradation * 100).toFixed(1)}% degradation`,
        {
          duration: ALERT_CONFIG.toastDuration,
          position: ALERT_CONFIG.toastPosition,
        }
      );
    });
  }
};

// Send metrics to analytics
const sendMetrics = async (metrics: { [key: string]: number }) => {
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Error sending performance metrics:', error);
  }
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Initial metrics collection
    const initialMetrics = collectMetrics();
    sendMetrics(initialMetrics);

    // Set up periodic collection
    const interval = setInterval(() => {
      const metrics = collectMetrics();
      sendMetrics(metrics);
    }, 60000); // Collect every minute

    // Cleanup
    return () => clearInterval(interval);
  }, []);
};

export default reportWebVitals; 