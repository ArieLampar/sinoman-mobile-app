import { useEffect, useRef } from 'react';

/**
 * Performance monitoring utility
 * Helps track performance marks and measures
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  /**
   * Creates a performance mark with the given name
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());
    if (__DEV__) {
      console.log(`[Performance Mark] ${name}`);
    }
  }

  /**
   * Measures the time between a start mark and now
   * @returns Duration in milliseconds
   */
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`[Performance] No mark found with name: ${startMark}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.measures.set(name, duration);

    if (__DEV__) {
      console.log(`[Performance Measure] ${name}: ${duration}ms`);
    }

    return duration;
  }

  /**
   * Gets all measures
   */
  getMeasures(): Map<string, number> {
    return new Map(this.measures);
  }

  /**
   * Clears all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }

  /**
   * Gets a summary report of all measures
   */
  getReport(): string {
    const measures = Array.from(this.measures.entries());
    if (measures.length === 0) {
      return 'No measures recorded';
    }

    return measures
      .map(([name, duration]) => `${name}: ${duration}ms`)
      .join('\n');
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to track component render count
 * Useful for debugging unnecessary re-renders
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`[Render Count] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

/**
 * Hook to track component mount/unmount lifecycle
 */
export function useComponentLifecycle(componentName: string): void {
  useEffect(() => {
    if (__DEV__) {
      console.log(`[Lifecycle] ${componentName} mounted`);
    }

    return () => {
      if (__DEV__) {
        console.log(`[Lifecycle] ${componentName} unmounted`);
      }
    };
  }, [componentName]);
}

/**
 * Measures the execution time of an operation
 * @param name Name of the operation
 * @param operation Function to measure
 * @returns Result of the operation
 */
export function measureOperation<T>(name: string, operation: () => T): T {
  const startTime = Date.now();

  try {
    const result = operation();
    const duration = Date.now() - startTime;

    if (__DEV__) {
      console.log(`[Operation] ${name} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (__DEV__) {
      console.error(`[Operation] ${name} failed after ${duration}ms`, error);
    }
    throw error;
  }
}

/**
 * Measures the execution time of an async operation
 */
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    if (__DEV__) {
      console.log(`[Async Operation] ${name} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (__DEV__) {
      console.error(`[Async Operation] ${name} failed after ${duration}ms`, error);
    }
    throw error;
  }
}

/**
 * Creates a debounced version of a function
 * Useful for optimizing frequent callbacks (search, scroll, etc.)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Creates a throttled version of a function
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
