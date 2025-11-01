// パフォーマンスメトリクスの型定義
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  pageLoad: PerformanceMetric[];
  apiCalls: PerformanceMetric[];
  userInteractions: PerformanceMetric[];
  resourceLoad: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averagePageLoad: number;
    averageApiResponse: number;
    slowestOperation: PerformanceMetric | null;
  };
}

// パフォーマンス監視クラス
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // 初期化
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // ページ読み込み時間の監視
      this.observePageLoad();
      
      // リソース読み込み時間の監視
      this.observeResourceLoad();
      
      // ユーザー操作の監視
      this.observeUserInteractions();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  // ページ読み込み時間の監視
  private observePageLoad(): void {
    if (typeof window === 'undefined') return;

    // Navigation Timing API
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        
        this.recordMetric('page_load_dom_content_loaded', 
          navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms');
        
        this.recordMetric('page_load_complete', 
          navEntry.loadEventEnd - navEntry.loadEventStart, 'ms');
        
        this.recordMetric('page_load_total', 
          navEntry.loadEventEnd - navEntry.fetchStart, 'ms');
      }
    }

    // ページ表示時間の監視
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              const paintEntry = entry as PerformancePaintTiming;
              this.recordMetric(`paint_${paintEntry.name}`, paintEntry.startTime, 'ms');
            }
          }
        });
        
        observer.observe({ entryTypes: ['paint'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Paint timing observation failed:', error);
      }
    }
  }

  // リソース読み込み時間の監視
  private observeResourceLoad(): void {
    if (typeof window === 'undefined') return;

    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              
              // 重要なリソースのみ記録
              if (resourceEntry.duration > 100) { // 100ms以上
                this.recordMetric('resource_load', resourceEntry.duration, 'ms', {
                  name: resourceEntry.name,
                  type: resourceEntry.initiatorType,
                  size: resourceEntry.transferSize,
                });
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Resource timing observation failed:', error);
      }
    }
  }

  // ユーザー操作の監視
  private observeUserInteractions(): void {
    if (typeof window === 'undefined') return;

    // クリックイベントの監視
    let clickStartTime = 0;
    
    document.addEventListener('click', (event) => {
      clickStartTime = performance.now();
    }, { capture: true });

    document.addEventListener('click', (event) => {
      if (clickStartTime > 0) {
        const clickDuration = performance.now() - clickStartTime;
        this.recordMetric('click_response', clickDuration, 'ms', {
          target: (event.target as Element)?.tagName || 'unknown',
          path: event.composedPath().map(el => (el as Element)?.tagName).join(' > '),
        });
        clickStartTime = 0;
      }
    }, { capture: false });

    // キーボード入力の監視
    let keyPressStartTime = 0;
    
    document.addEventListener('keydown', () => {
      keyPressStartTime = performance.now();
    }, { capture: true });

    document.addEventListener('keyup', (event) => {
      if (keyPressStartTime > 0) {
        const keyPressDuration = performance.now() - keyPressStartTime;
        this.recordMetric('key_press', keyPressDuration, 'ms', {
          key: event.key,
          code: event.code,
        });
        keyPressStartTime = 0;
      }
    }, { capture: false });
  }

  // メトリクスの記録
  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);
    
    // メトリクスが多すぎる場合は古いものを削除
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // API呼び出し時間の記録
  recordApiCall(url: string, method: string, duration: number, status: number): void {
    this.recordMetric('api_call', duration, 'ms', {
      url,
      method,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // カスタムメトリクスの記録
  recordCustomMetric(name: string, value: number, unit: string, metadata?: Record<string, any>): void {
    this.recordMetric(`custom_${name}`, value, unit, metadata);
  }

  // パフォーマンスレポートの生成
  generateReport(): PerformanceReport {
    const pageLoad = this.metrics.filter(m => m.name.startsWith('page_load') || m.name.startsWith('paint'));
    const apiCalls = this.metrics.filter(m => m.name === 'api_call');
    const userInteractions = this.metrics.filter(m => m.name.startsWith('click') || m.name.startsWith('key'));
    const resourceLoad = this.metrics.filter(m => m.name === 'resource_load');

    // 平均値の計算
    const averagePageLoad = pageLoad.length > 0 
      ? pageLoad.reduce((sum, m) => sum + m.value, 0) / pageLoad.length 
      : 0;
    
    const averageApiResponse = apiCalls.length > 0 
      ? apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length 
      : 0;

    // 最も遅い操作の特定
    const allMetrics = [...pageLoad, ...apiCalls, ...userInteractions, ...resourceLoad];
    const slowestOperation = allMetrics.length > 0 
      ? allMetrics.reduce((slowest, current) => current.value > slowest.value ? current : slowest)
      : null;

    return {
      pageLoad,
      apiCalls,
      userInteractions,
      resourceLoad,
      summary: {
        totalMetrics: this.metrics.length,
        averagePageLoad: Math.round(averagePageLoad * 100) / 100,
        averageApiResponse: Math.round(averageApiResponse * 100) / 100,
        slowestOperation,
      },
    };
  }

  // メトリクスの取得
  getMetrics(filter?: { name?: string; startTime?: string; endTime?: string }): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (filter?.name) {
      filtered = filtered.filter(m => m.name.includes(filter.name!));
    }

    if (filter?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  // メトリクスのクリア
  clearMetrics(): void {
    this.metrics = [];
  }

  // メトリクスのエクスポート
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  // パフォーマンス警告のチェック
  checkPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    const report = this.generateReport();

    // ページ読み込み時間の警告
    if (report.summary.averagePageLoad > 3000) {
      warnings.push('ページ読み込み時間が3秒を超えています。最適化が必要です。');
    }

    // API応答時間の警告
    if (report.summary.averageApiResponse > 1000) {
      warnings.push('API応答時間が1秒を超えています。サーバー側の最適化が必要です。');
    }

    // リソース読み込み時間の警告
    const slowResources = report.resourceLoad.filter(r => r.value > 500);
    if (slowResources.length > 5) {
      warnings.push(`${slowResources.length}個のリソースが500ms以上かかって読み込まれています。`);
    }

    return warnings;
  }

  // クリーンアップ
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.isInitialized = false;
  }
}

// パフォーマンス監視のインスタンス
export const performanceMonitor = new PerformanceMonitor();

// ユーティリティ関数
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordCustomMetric(operation, duration, 'ms', metadata);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordCustomMetric(`${operation}_error`, duration, 'ms', {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

// API呼び出しのパフォーマンス測定
export const measureApiCall = async <T>(
  url: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordApiCall(url, method, duration, 200);
    
    return result;
  } catch (error: any) {
    const duration = performance.now() - startTime;
    const status = error.response?.status || 0;
    
    performanceMonitor.recordApiCall(url, method, duration, status);
    throw error;
  }
};

// デフォルトエクスポート
export default performanceMonitor;










