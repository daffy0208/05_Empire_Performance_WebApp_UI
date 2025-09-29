import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { logger, performanceMonitor } from '../lib/monitoring';

// Analytics event types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

// Performance metrics
export interface PerformanceMetrics {
  name: string;
  duration: number;
  threshold?: number;
}

// Custom analytics hook
export const useAnalytics = () => {
  const location = useLocation();
  const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  const isPerformanceEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

  // Track page views
  useEffect(() => {
    if (isAnalyticsEnabled) {
      trackPageView(location.pathname, location.search);
    }
  }, [location.pathname, location.search, isAnalyticsEnabled]);

  // Track page view
  const trackPageView = useCallback((path: string, search: string = '') => {
    const event: AnalyticsEvent = {
      category: 'Navigation',
      action: 'page_view',
      label: path + search,
      properties: {
        path,
        search,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }
    };

    logger.info('Page view tracked', event);

    // Here you would integrate with your analytics service
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: path });
  }, []);

  // Track custom events
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!isAnalyticsEnabled) return;

    logger.info('Event tracked', event);

    // Here you would send to your analytics service
    // Example: gtag('event', event.action, {
    //   event_category: event.category,
    //   event_label: event.label,
    //   value: event.value,
    //   custom_parameters: event.properties
    // });
  }, [isAnalyticsEnabled]);

  // Track user interactions
  const trackClick = useCallback((element: string, section?: string) => {
    trackEvent({
      category: 'User Interaction',
      action: 'click',
      label: element,
      properties: { section }
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    trackEvent({
      category: 'Form',
      action: success ? 'submit_success' : 'submit_error',
      label: formName,
    });
  }, [trackEvent]);

  const trackError = useCallback((errorType: string, errorMessage: string, component?: string) => {
    trackEvent({
      category: 'Error',
      action: errorType,
      label: errorMessage,
      properties: { component }
    });
  }, [trackEvent]);

  // Performance tracking
  const trackPerformance = useCallback((metrics: PerformanceMetrics) => {
    if (!isPerformanceEnabled) return;

    logger.info('Performance metric', metrics);

    // Log slow operations
    if (metrics.threshold && metrics.duration > metrics.threshold) {
      logger.warn(`Slow operation: ${metrics.name}`, {
        duration: `${metrics.duration}ms`,
        threshold: `${metrics.threshold}ms`
      });
    }

    trackEvent({
      category: 'Performance',
      action: metrics.name,
      value: Math.round(metrics.duration),
      properties: {
        threshold: metrics.threshold,
        is_slow: metrics.threshold ? metrics.duration > metrics.threshold : false
      }
    });
  }, [isPerformanceEnabled, trackEvent]);

  // Measure and track async operations
  const measureAsync = useCallback(async <T>(
    name: string,
    asyncFn: () => Promise<T>,
    threshold?: number
  ): Promise<T> => {
    if (!isPerformanceEnabled) return asyncFn();

    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - startTime;

      trackPerformance({ name, duration, threshold });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      trackPerformance({ name: `${name}_error`, duration, threshold });
      throw error;
    }
  }, [isPerformanceEnabled, trackPerformance]);

  return {
    // Event tracking
    trackEvent,
    trackClick,
    trackFormSubmit,
    trackError,
    trackPageView,

    // Performance tracking
    trackPerformance,
    measureAsync,

    // Utilities
    isAnalyticsEnabled,
    isPerformanceEnabled,
  };
};

// Higher-order component for automatic performance tracking
export const withPerformanceTracking = <P extends {}>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    const { trackPerformance } = useAnalytics();

    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const renderTime = performance.now() - startTime;
        trackPerformance({
          name: `component_render_${componentName}`,
          duration: renderTime,
          threshold: 16 // 60fps threshold
        });
      };
    }, [trackPerformance]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return WrappedComponent;
};

// Hook for tracking user sessions
export const useSessionTracking = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Track session start
    const sessionStart = Date.now();
    trackEvent({
      category: 'Session',
      action: 'start',
      properties: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }
    });

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStart;
      trackEvent({
        category: 'Session',
        action: 'end',
        value: sessionDuration,
        properties: {
          duration: sessionDuration,
          timestamp: new Date().toISOString(),
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackEvent]);
};

// Hook for tracking feature usage
export const useFeatureTracking = () => {
  const { trackEvent } = useAnalytics();

  const trackFeatureUsage = useCallback((featureName: string, action: string, properties?: Record<string, any>) => {
    trackEvent({
      category: 'Feature',
      action: `${featureName}_${action}`,
      label: featureName,
      properties
    });
  }, [trackEvent]);

  return { trackFeatureUsage };
};