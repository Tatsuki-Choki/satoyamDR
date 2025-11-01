// ログレベル
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// ログエントリの型定義
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
}

// ログ設定
export interface LoggerConfig {
  level: LogLevel;
  maxEntries: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

// デフォルト設定
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  maxEntries: 1000,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false,
};

// ロガークラス
export class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.loadUserId();
  }

  // セッションID生成
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ユーザーIDの読み込み
  private loadUserId(): void {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        const user = JSON.parse(adminUser);
        this.userId = user.id;
      }
    } catch (error) {
      console.warn('Failed to load user ID:', error);
    }
  }

  // ログエントリの作成
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      requestId: this.getCurrentRequestId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  // 現在のリクエストIDを取得
  private getCurrentRequestId(): string | undefined {
    // カスタムヘッダーからリクエストIDを取得する方法を実装
    return undefined;
  }

  // ログレベルの文字列表現
  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.FATAL: return 'FATAL';
      default: return 'UNKNOWN';
    }
  }

  // コンソールログ出力
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { level, message, data, timestamp, userId, sessionId } = entry;
    const levelStr = this.getLevelString(level);
    const prefix = `[${timestamp}] [${levelStr}] [${sessionId}]`;
    
    if (userId) {
      console.log(`${prefix} [User: ${userId}] ${message}`, data || '');
    } else {
      console.log(`${prefix} ${message}`, data || '');
    }
  }

  // ローカルストレージログ出力
  private logToStorage(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    try {
      const logs = this.getStoredLogs();
      logs.push(entry);
      
      // 最大エントリ数を超えた場合は古いログを削除
      if (logs.length > this.config.maxEntries) {
        logs.splice(0, logs.length - this.config.maxEntries);
      }
      
      localStorage.setItem('satoyama_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store log:', error);
    }
  }

  // リモートログ出力
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to remote:', error);
    }
  }

  // ログ出力の実行
  private async log(level: LogLevel, message: string, data?: any): Promise<void> {
    if (level < this.config.level) return;

    const entry = this.createLogEntry(level, message, data);
    
    // コンソールログ
    this.logToConsole(entry);
    
    // ローカルストレージログ
    this.logToStorage(entry);
    
    // リモートログ（非同期）
    if (this.config.enableRemote) {
      this.logToRemote(entry).catch(console.warn);
    }
  }

  // パブリックメソッド
  async debug(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.DEBUG, message, data);
  }

  async info(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.INFO, message, data);
  }

  async warn(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.WARN, message, data);
  }

  async error(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.ERROR, message, data);
  }

  async fatal(message: string, data?: any): Promise<void> {
    await this.log(LogLevel.FATAL, message, data);
  }

  // ログの取得
  getStoredLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('satoyama_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.warn('Failed to get stored logs:', error);
      return [];
    }
  }

  // ログのクリア
  clearStoredLogs(): void {
    try {
      localStorage.removeItem('satoyama_logs');
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }

  // ログのエクスポート
  exportLogs(): string {
    try {
      const logs = this.getStoredLogs();
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.warn('Failed to export logs:', error);
      return '[]';
    }
  }

  // 設定の更新
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // ユーザーIDの更新
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // セッションIDの取得
  getSessionId(): string {
    return this.sessionId;
  }
}

// デフォルトロガーインスタンス
export const logger = new Logger();

// ユーティリティ関数
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logError = (message: string, data?: any) => logger.error(message, data);
export const logFatal = (message: string, data?: any) => logger.fatal(message, data);

// エラーログ用のヘルパー
export const logApiError = (error: any, context?: string) => {
  const message = context ? `${context}: ${getErrorMessage(error)}` : getErrorMessage(error);
  logger.error(message, {
    error,
    context,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

// パフォーマンスログ用のヘルパー
export const logPerformance = (operation: string, duration: number, data?: any) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration,
    data,
    timestamp: new Date().toISOString(),
  });
};










