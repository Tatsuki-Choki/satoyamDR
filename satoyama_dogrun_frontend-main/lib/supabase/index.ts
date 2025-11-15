/**
 * Supabase Module Exports
 *
 * すべてのSupabase関連モジュールをエクスポート
 */

// Client
export {
  supabase,
  getCurrentUser,
  getCurrentSession,
  signOut,
  onAuthStateChange
} from './client';

// Storage
export {
  uploadFile,
  upsertFile,
  deleteFile,
  deleteFiles,
  getPublicUrl,
  getSignedUrl,
  uploadAvatar,
  uploadPostImages,
  uploadVaccineCertificate,
  getVaccineCertificateUrl
} from './storage';

export type { BucketName } from './storage';

// Types
export type { Database } from './types';
