/**
 * Supabase Client Configuration
 *
 * フロントエンド用のSupabaseクライアント設定
 * - ブラウザ環境で動作
 * - RLS（Row Level Security）が適用される
 * - 認証済みユーザーのコンテキストで実行
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Supabase Client インスタンス
 *
 * 使用方法:
 * ```ts
 * import { supabase } from '@/lib/supabase/client';
 *
 * // データ取得
 * const { data, error } = await supabase
 *   .from('posts')
 *   .select('*')
 *   .limit(10);
 *
 * // 認証
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * 現在のユーザーを取得
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return user;
};

/**
 * 現在のセッションを取得
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
};

/**
 * サインアウト
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * 認証状態の変更を監視
 *
 * 使用方法:
 * ```ts
 * useEffect(() => {
 *   const { data: { subscription } } = supabase.auth.onAuthStateChange(
 *     (event, session) => {
 *       console.log(event, session);
 *     }
 *   );
 *   return () => subscription.unsubscribe();
 * }, []);
 * ```
 */
export const onAuthStateChange = supabase.auth.onAuthStateChange.bind(supabase.auth);
