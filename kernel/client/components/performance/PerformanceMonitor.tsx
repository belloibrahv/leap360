/**
 * Performance Monitor - Nigerian Market Optimization
 * 
 * Lightweight performance monitoring for Nigerian internet conditions.
 */

"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  connectionType: string;
  isSlowConnection: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    connectionType: 'unknown',
    isSlowConnection: false
  });

  useEffect(() => {
    // Measure page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Detect connection type (for Nigerian network conditions)
      const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
      const connectionType = connection?.effectiveType || 'unknown';
      const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connectionType);
      
      setMetrics({
        loadTime,
        connectionType,
        isSlowConnection
      });

      // Log performance for Nigerian market analysis
      if (process.env.NODE_ENV === 'development') {
        console.log('🇳🇬 Nigerian Market Performance:', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          connectionType,
          isSlowConnection,
          recommendation: isSlowConnection ? 'Optimize for slow connections' : 'Performance is good'
        });
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return metrics;
};

// Performance optimization tips for Nigerian users
export const PerformanceTips: React.FC = () => {
  const { isSlowConnection, connectionType } = usePerformanceMonitor();

  if (!isSlowConnection) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm max-w-xs z-50">
      <div className="flex items-center">
        <span className="text-yellow-600 mr-2">⚡</span>
        <div>
          <p className="font-medium text-yellow-800">Slow Connection Detected</p>
          <p className="text-yellow-700">
            {connectionType === '2g' ? 'Consider using data-saver mode' : 'Loading optimized for your connection'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default usePerformanceMonitor;