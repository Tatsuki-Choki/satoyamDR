// セキュリティ設定
export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

// デフォルトセキュリティ設定
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

// パスワード検証クラス
export class PasswordValidator {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  // パスワードの強度を検証
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    // 長さチェック
    if (password.length < this.config.passwordMinLength) {
      errors.push(`パスワードは最低${this.config.passwordMinLength}文字である必要があります`);
    } else {
      score += 1;
    }

    // 大文字チェック
    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('パスワードには大文字が含まれる必要があります');
    } else {
      score += 1;
    }

    // 小文字チェック
    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('パスワードには小文字が含まれる必要があります');
    } else {
      score += 1;
    }

    // 数字チェック
    if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('パスワードには数字が含まれる必要があります');
    } else {
      score += 1;
    }

    // 特殊文字チェック
    if (this.config.passwordRequireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('パスワードには特殊文字が含まれる必要があります');
    } else {
      score += 1;
    }

    // 強度判定
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) {
      strength = 'strong';
    } else if (score >= 2) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  // パスワードの強度を視覚的に表示
  getPasswordStrengthIndicator(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    message: string;
  } {
    const validation = this.validatePassword(password);
    
    switch (validation.strength) {
      case 'strong':
        return {
          strength: 'strong',
          color: 'text-green-600',
          message: '強力なパスワードです',
        };
      case 'medium':
        return {
          strength: 'medium',
          color: 'text-yellow-600',
          message: '中程度の強度です',
        };
      case 'weak':
        return {
          strength: 'weak',
          color: 'text-red-600',
          message: '弱いパスワードです',
        };
    }
  }
}

// セッション管理クラス
export class SessionManager {
  private config: SecurityConfig;
  private sessionKey = 'satoyama_session';

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  // セッションの作成
  createSession(userId: string, userData: any): void {
    const session = {
      userId,
      userData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeoutMinutes * 60 * 1000).toISOString(),
    };

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  // セッションの取得
  getSession(): any | null {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // セッションの有効性チェック
      if (this.isSessionExpired(session)) {
        this.destroySession();
        return null;
      }

      // 最終アクティビティを更新
      session.lastActivity = new Date().toISOString();
      this.updateSession(session);

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // セッションの更新
  private updateSession(session: any): void {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  // セッションの破棄
  destroySession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.error('Failed to destroy session:', error);
    }
  }

  // セッションの有効期限チェック
  private isSessionExpired(session: any): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    return now > expiresAt;
  }

  // セッションの有効期限を延長
  extendSession(): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = new Date(Date.now() + this.config.sessionTimeoutMinutes * 60 * 1000).toISOString();
      this.updateSession(session);
    }
  }

  // セッションの残り時間を取得（分）
  getSessionTimeRemaining(): number {
    const session = this.getSession();
    if (!session) return 0;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const remainingMs = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
  }
}

// ログイン試行管理クラス
export class LoginAttemptManager {
  private config: SecurityConfig;
  private attemptsKey = 'satoyama_login_attempts';
  private lockoutKey = 'satoyama_lockout';

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  // ログイン試行を記録
  recordLoginAttempt(email: string, success: boolean): void {
    try {
      const attempts = this.getLoginAttempts();
      
      if (success) {
        // 成功時は試行回数をリセット
        this.clearLoginAttempts(email);
        return;
      }

      // 失敗時は試行回数を増加
      if (!attempts[email]) {
        attempts[email] = [];
      }

      attempts[email].push({
        timestamp: new Date().toISOString(),
        ip: this.getClientIP(),
        userAgent: navigator.userAgent,
      });

      // 古い試行記録を削除（24時間前より古いもの）
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      attempts[email] = attempts[email].filter(
        attempt => new Date(attempt.timestamp) > oneDayAgo
      );

      localStorage.setItem(this.attemptsKey, JSON.stringify(attempts));

      // ロックアウトチェック
      if (attempts[email].length >= this.config.maxLoginAttempts) {
        this.setLockout(email);
      }
    } catch (error) {
      console.error('Failed to record login attempt:', error);
    }
  }

  // ログイン試行回数を取得
  getLoginAttempts(): Record<string, any[]> {
    try {
      const attempts = localStorage.getItem(this.attemptsKey);
      return attempts ? JSON.parse(attempts) : {};
    } catch (error) {
      console.error('Failed to get login attempts:', error);
      return {};
    }
  }

  // ログイン試行をクリア
  clearLoginAttempts(email: string): void {
    try {
      const attempts = this.getLoginAttempts();
      delete attempts[email];
      localStorage.setItem(this.attemptsKey, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to clear login attempts:', error);
    }
  }

  // ロックアウトを設定
  private setLockout(email: string): void {
    try {
      const lockout = {
        email,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.lockoutDurationMinutes * 60 * 1000).toISOString(),
      };

      localStorage.setItem(this.lockoutKey, JSON.stringify(lockout));
    } catch (error) {
      console.error('Failed to set lockout:', error);
    }
  }

  // ロックアウト状態をチェック
  isLockedOut(email: string): boolean {
    try {
      const lockoutData = localStorage.getItem(this.lockoutKey);
      if (!lockoutData) return false;

      const lockout = JSON.parse(lockoutData);
      
      if (lockout.email !== email) return false;

      // ロックアウトの有効期限チェック
      if (new Date() > new Date(lockout.expiresAt)) {
        localStorage.removeItem(this.lockoutKey);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check lockout status:', error);
      return false;
    }
  }

  // ロックアウトの残り時間を取得（分）
  getLockoutTimeRemaining(email: string): number {
    try {
      const lockoutData = localStorage.getItem(this.lockoutKey);
      if (!lockoutData) return 0;

      const lockout = JSON.parse(lockoutData);
      
      if (lockout.email !== email) return 0;

      const now = new Date();
      const expiresAt = new Date(lockout.expiresAt);
      const remainingMs = expiresAt.getTime() - now.getTime();
      
      return Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
    } catch (error) {
      console.error('Failed to get lockout time remaining:', error);
      return 0;
    }
  }

  // クライアントIPアドレスを取得（簡易版）
  private getClientIP(): string {
    // 実際の実装では、サーバーサイドからIPアドレスを取得する
    return 'unknown';
  }
}

// アクセス制御クラス
export class AccessControl {
  // 管理者権限チェック
  static isAdmin(user: any): boolean {
    return user && user.role === 'super_admin';
  }

  // モデレーター権限チェック
  static isModerator(user: any): boolean {
    return user && (user.role === 'moderator' || user.role === 'super_admin');
  }

  // 特定の権限チェック
  static hasPermission(user: any, permission: string): boolean {
    if (!user) return false;

    switch (permission) {
      case 'user_management':
        return this.isModerator(user);
      case 'content_moderation':
        return this.isModerator(user);
      case 'system_admin':
        return this.isAdmin(user);
      default:
        return false;
    }
  }

  // ページアクセス権限チェック
  static canAccessPage(user: any, page: string): boolean {
    if (!user) return false;

    switch (page) {
      case 'admin':
        return this.isModerator(user);
      case 'admin/users':
        return this.isModerator(user);
      case 'admin/settings':
        return this.isAdmin(user);
      default:
        return true;
    }
  }
}

// セキュリティユーティリティ
export const securityUtils = {
  // パスワードバリデーター
  passwordValidator: new PasswordValidator(),
  
  // セッションマネージャー
  sessionManager: new SessionManager(),
  
  // ログイン試行マネージャー
  loginAttemptManager: new LoginAttemptManager(),
  
  // アクセス制御
  accessControl: AccessControl,
};

// デフォルトエクスポート
export default securityUtils;










