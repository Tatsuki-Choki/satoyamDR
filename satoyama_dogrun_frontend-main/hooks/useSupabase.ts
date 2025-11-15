/**
 * Supabase Data Fetching Hooks
 *
 * Supabaseクライアントを使用したデータフェッチフック
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Tables = Database['public']['Tables'];

interface UseSupabaseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseSupabaseQueryReturn<T> extends UseSupabaseQueryState<T> {
  refetch: () => Promise<void>;
}

/**
 * 汎用的なSupabaseクエリフック
 *
 * @param queryFn Supabaseクエリ関数
 * @param dependencies 依存配列
 * @param immediate 即座に実行するかどうか
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  immediate = true
): UseSupabaseQueryReturn<T> {
  const [state, setState] = useState<UseSupabaseQueryState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await queryFn();
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Supabase query error:', error);
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    refetch: execute,
  };
}

/**
 * 投稿一覧を取得
 *
 * @param limit 取得件数（デフォルト: 20）
 * @param offset オフセット（デフォルト: 0）
 */
export function usePosts(limit = 20, offset = 0) {
  return useSupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, name, avatar_url)
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }, [limit, offset]);
}

/**
 * 特定の投稿を取得
 *
 * @param postId 投稿ID
 */
export function usePost(postId: string | null) {
  return useSupabaseQuery(async () => {
    if (!postId) return null;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (id, name, avatar_url),
        comments (
          *,
          users:user_id (id, name, avatar_url)
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  }, [postId]);
}

/**
 * ユーザーの犬一覧を取得
 *
 * @param userId ユーザーID（nullの場合は現在のユーザー）
 */
export function useUserDogs(userId: string | null = null) {
  return useSupabaseQuery(async () => {
    let query = supabase
      .from('dogs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }, [userId]);
}

/**
 * 特定の犬の情報を取得
 *
 * @param dogId 犬ID
 */
export function useDog(dogId: string | null) {
  return useSupabaseQuery(async () => {
    if (!dogId) return null;

    const { data, error } = await supabase
      .from('dogs')
      .select(`
        *,
        vaccination_records (*)
      `)
      .eq('id', dogId)
      .single();

    if (error) throw error;
    return data;
  }, [dogId]);
}

/**
 * イベント一覧を取得
 */
export function useEvents() {
  return useSupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('end_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }, []);
}

/**
 * お知らせ一覧を取得
 */
export function useNotices() {
  return useSupabaseQuery(async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('status', 'published')
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }, []);
}

/**
 * 営業時間を取得
 */
export function useBusinessHours() {
  return useSupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data;
  }, []);
}

/**
 * 利用規約を取得
 */
export function useTerms() {
  return useSupabaseQuery(async () => {
    const { data, error } = await supabase
      .from('terms')
      .select('*')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }, []);
}

/**
 * 投稿にいいねを追加
 *
 * @param postId 投稿ID
 */
export async function likePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: user.id });

  if (error) throw error;

  // いいね数を更新
  await supabase.rpc('increment_likes_count', { post_id: postId });
}

/**
 * 投稿のいいねを削除
 *
 * @param postId 投稿ID
 */
export async function unlikePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;

  // いいね数を更新
  await supabase.rpc('decrement_likes_count', { post_id: postId });
}

/**
 * 投稿にコメントを追加
 *
 * @param postId 投稿ID
 * @param content コメント内容
 */
export async function addComment(postId: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    });

  if (error) throw error;

  // コメント数を更新
  await supabase.rpc('increment_comments_count', { post_id: postId });
}

/**
 * ブックマークを追加
 *
 * @param postId 投稿ID
 */
export async function bookmarkPost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookmarks')
    .insert({ post_id: postId, user_id: user.id });

  if (error) throw error;
}

/**
 * ブックマークを削除
 *
 * @param postId 投稿ID
 */
export async function unbookmarkPost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * ユーザーのブックマーク一覧を取得
 */
export function useUserBookmarks() {
  return useSupabaseQuery(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        posts:post_id (
          *,
          users:user_id (id, name, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }, []);
}

/**
 * リアルタイムサブスクリプション用のフック
 *
 * @param table テーブル名
 * @param filter フィルター
 * @param callback コールバック関数
 */
export function useRealtimeSubscription<T extends keyof Tables>(
  table: T,
  filter?: string,
  callback?: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          callback?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, callback]);
}
