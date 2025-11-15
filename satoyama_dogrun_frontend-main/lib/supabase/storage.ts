/**
 * Supabase Storage Helper Functions
 *
 * ファイルアップロード・ダウンロード・削除のヘルパー関数
 */

import { supabase } from './client';

export type BucketName = 'avatars' | 'posts' | 'vaccine-certificates';

/**
 * ファイルをアップロード
 *
 * @param bucket バケット名
 * @param path ファイルパス（バケット内のパス）
 * @param file アップロードするファイル
 * @returns アップロードされたファイルのパス
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File
): Promise<{ path: string; url: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false, // 同じパスのファイルが存在する場合はエラー
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const url = getPublicUrl(bucket, data.path);
  return { path: data.path, url };
}

/**
 * 既存ファイルを上書きアップロード
 *
 * @param bucket バケット名
 * @param path ファイルパス
 * @param file アップロードするファイル
 * @returns アップロードされたファイルのパス
 */
export async function upsertFile(
  bucket: BucketName,
  path: string,
  file: File
): Promise<{ path: string; url: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true, // 同じパスのファイルが存在する場合は上書き
    });

  if (error) {
    console.error('Upsert error:', error);
    throw new Error(`Failed to upsert file: ${error.message}`);
  }

  const url = getPublicUrl(bucket, data.path);
  return { path: data.path, url };
}

/**
 * ファイルを削除
 *
 * @param bucket バケット名
 * @param path ファイルパス
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * 複数のファイルを削除
 *
 * @param bucket バケット名
 * @param paths ファイルパスの配列
 */
export async function deleteFiles(
  bucket: BucketName,
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.error('Delete files error:', error);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}

/**
 * 公開URLを取得
 *
 * @param bucket バケット名
 * @param path ファイルパス
 * @returns 公開URL（avatarsとpostsの場合）
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * 署名付きURL（期限付き）を取得
 *
 * vaccine-certificates バケット用（非公開）
 *
 * @param bucket バケット名
 * @param path ファイルパス
 * @param expiresIn 有効期限（秒）デフォルト: 3600秒（1時間）
 * @returns 署名付きURL
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Signed URL error:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * アバター画像をアップロード
 *
 * @param userId ユーザーID
 * @param file 画像ファイル
 * @returns アップロードされた画像のURL
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { url } = await upsertFile('avatars', filePath, file);
  return url;
}

/**
 * 投稿画像をアップロード
 *
 * @param userId ユーザーID
 * @param postId 投稿ID
 * @param files 画像ファイルの配列
 * @returns アップロードされた画像のURL配列
 */
export async function uploadPostImages(
  userId: string,
  postId: string,
  files: File[]
): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${postId}_${index}.${fileExt}`;
    const filePath = `${userId}/${postId}/${fileName}`;

    const { url } = await uploadFile('posts', filePath, file);
    return url;
  });

  return Promise.all(uploadPromises);
}

/**
 * ワクチン証明書をアップロード
 *
 * @param userId ユーザーID
 * @param dogId 犬ID
 * @param vaccinationId ワクチン接種記録ID
 * @param file 証明書ファイル
 * @returns アップロードされたファイルのパス（署名付きURL取得用）
 */
export async function uploadVaccineCertificate(
  userId: string,
  dogId: string,
  vaccinationId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vaccinationId}.${fileExt}`;
  const filePath = `${userId}/${dogId}/${fileName}`;

  const { path } = await uploadFile('vaccine-certificates', filePath, file);
  return path;
}

/**
 * ワクチン証明書の署名付きURLを取得
 *
 * @param path ファイルパス
 * @param expiresIn 有効期限（秒）デフォルト: 3600秒（1時間）
 * @returns 署名付きURL
 */
export async function getVaccineCertificateUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  return getSignedUrl('vaccine-certificates', path, expiresIn);
}
