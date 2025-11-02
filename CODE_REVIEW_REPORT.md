# コードレビュー報告書

## レビュー実施日
2025年11月2日

## 確認項目
1. 潜在的なバグの確認
2. コード品質の確認
3. 型安全性の確認

---

## 🔴 重大な問題（High Priority）

### 1. 型安全性の問題：`any`型の多用

**場所**: `lib/api/user-api.ts:78`, `app/page.tsx:143,180`

**問題**:
```typescript
submitApplication: async (data: any): Promise<ApplicationStatusResponse> => {
  // ...
}
```

**影響**: 型チェックが効かず、実行時エラーのリスクが高い

**推奨修正**:
```typescript
interface ApplicationFormData {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  // ... 他のフィールド
}

submitApplication: async (data: ApplicationFormData): Promise<ApplicationStatusResponse> => {
```

### 2. メモリリーク：`URL.createObjectURL`の解放漏れ

**場所**: `components/create-post-modal.tsx:141`

**問題**:
```typescript
<img src={URL.createObjectURL(file)} alt={`選択画像 ${index + 1}`} />
```

**影響**: メモリリークの原因。`URL.revokeObjectURL`で解放されていない

**推奨修正**:
```typescript
const [imageUrls, setImageUrls] = useState<string[]>([])

useEffect(() => {
  const urls = selectedImages.map(file => URL.createObjectURL(file))
  setImageUrls(urls)
  
  return () => {
    urls.forEach(url => URL.revokeObjectURL(url))
  }
}, [selectedImages])
```

### 3. エラーハンドリング不足：APIレスポンスの検証なし

**場所**: `components/post-feed.tsx:94,168`

**問題**:
```typescript
const data = await response.json()
// データの検証なしにそのまま使用
```

**影響**: 予期しないデータ形式でエラーが発生する可能性

**推奨修正**:
```typescript
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}
const data = await response.json()
if (!Array.isArray(data)) {
  console.error("予期しないデータ形式:", data)
  return
}
```

---

## 🟡 中程度の問題（Medium Priority）

### 4. 型安全性：`as any`の使用

**場所**: `components/home-section.tsx:329-333`

**問題**:
```typescript
userStatus !== (UserStatus as any).LoggedIn
```

**影響**: 型安全性が損なわれる

**推奨修正**:
```typescript
userStatus !== UserStatus.LoggedIn
```

### 5. 型定義の不整合：`postId`の型が混在

**場所**: `lib/api/user-api.ts:46,278,296`

**問題**:
```typescript
interface AddCommentRequest {
  postId: number;  // number型
}
// しかし実際のAPIでは string型を使用
const response = await fetch(`/posts/${postId}/comments`)
```

**影響**: 型の不一致で実行時エラーの可能性

**推奨修正**:
```typescript
interface AddCommentRequest {
  postId: string;  // string型に統一
}
```

### 6. エラーハンドリング：トークンがない場合の処理不足

**場所**: `components/post-feed.tsx:122,157`

**問題**:
```typescript
const token = localStorage.getItem("access_token")
// tokenがnullの場合の処理がない
const response = await fetch(..., {
  headers: {
    Authorization: `Bearer ${token}`,  // tokenがnullの可能性
  },
})
```

**影響**: トークンがない場合に不正なリクエストが送信される

**推奨修正**:
```typescript
const token = localStorage.getItem("access_token")
if (!token) {
  toast.error("ログインが必要です")
  return
}
```

### 7. 重複コード：エラーハンドリングパターンの重複

**場所**: `lib/api/user-api.ts` (全関数)

**問題**: すべての関数で同じtry-catchパターンが繰り返されている

**推奨修正**: ラッパー関数を作成
```typescript
const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error("APIエラー:", error)
      throw error
    }
  }) as T
}
```

---

## 🟢 軽微な問題（Low Priority）

### 8. デバッグコードの残存

**場所**: `app/page.tsx:130,132,176`, `components/post-feed.tsx:73,83,110,113,147,192`

**問題**: `console.log`や`console.error`が本番コードに残っている

**推奨修正**: 開発環境のみで実行するように修正
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log("申請データ送信中:", formData)
}
```

### 9. ハードコードされた値

**場所**: `components/create-post-modal.tsx:55`

**問題**:
```typescript
image: selectedImages[0] // 暫定的に最初の画像のみ
```

**影響**: コメントの通り暫定的な実装。複数画像対応が必要

### 10. 型定義の不整合：`getUserProfile`の戻り値

**場所**: `lib/api/user-api.ts:155`

**問題**:
```typescript
getUserProfile: async (): Promise<any> => {
```

**推奨修正**:
```typescript
getUserProfile: async (): Promise<ApiResponse<OwnerProfile>> => {
```

### 11. フォームバリデーション不足

**場所**: `components/create-post-modal.tsx:31`

**問題**: テキストのみのバリデーション。画像サイズや形式のチェックがない

**推奨修正**:
```typescript
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if (file.size > MAX_IMAGE_SIZE) {
  toast.error("画像サイズは5MB以下にしてください")
  return
}
```

### 12. 競合状態（Race Condition）の可能性

**場所**: `components/post-feed.tsx:135-144`

**問題**: 非同期処理中に状態が更新される可能性

**推奨修正**: 関数型更新を使用
```typescript
setPosts(prevPosts => prevPosts.map(post => {
  if (post.id === postId) {
    return { ...post, is_liked: !isLiked, ... }
  }
  return post
}))
```

---

## 📊 統計

- **重大な問題**: 3件
- **中程度の問題**: 5件
- **軽微な問題**: 4件
- **合計**: 12件

---

## ✅ 推奨される対応優先順位

1. **最優先**: メモリリーク修正（`URL.createObjectURL`の解放）
2. **高優先**: 型安全性の向上（`any`型の削減）
3. **中優先**: エラーハンドリングの強化
4. **低優先**: コード品質の改善（デバッグコードの削除など）

---

## 💡 追加の推奨事項

1. **ESLint/TypeScript設定の強化**: `any`型の使用を禁止するルールを追加
2. **ユニットテストの追加**: 特にエラーハンドリング部分
3. **型定義の統一**: APIレスポンスの型定義を厳密に
4. **エラーハンドリングユーティリティの作成**: 共通のエラーハンドリングパターンを抽出

