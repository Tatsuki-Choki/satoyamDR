# デプロイメント設定

## Azure環境への デプロイ

### 環境変数の設定

Azure App Service で以下の環境変数を設定してください：

#### フロントエンド (Node.js)
```
NEXT_PUBLIC_API_URL=https://app-002-gen10-step3-2-py-oshima14.azurewebsites.net
```

#### バックエンド (Python)
```
ALLOWED_ORIGINS=https://app-002-gen10-step3-2-node-oshima14.azurewebsites.net
```

### 管理者認証情報（開発環境）

- Email: `admin@satoyama-dogrun.com`
- Password: `admin123`

**注意**: 本番環境リリース前に、管理者ログイン画面の開発用認証情報表示を削除してください。

### トラブルシューティング

#### CORS エラーが発生する場合

バックエンドの `main.py` で、フロントエンドのURLがCORS許可リストに含まれていることを確認：

```python
allowed_origins = [
    "https://app-002-gen10-step3-2-node-oshima14.azurewebsites.net",
    # その他のURL
]
```

#### API URLの二重スラッシュ問題

フロントエンドの環境変数で、API URLの末尾にスラッシュを含めないでください：
- ✅ 正しい: `https://app-002-gen10-step3-2-py-oshima14.azurewebsites.net`
- ❌ 間違い: `https://app-002-gen10-step3-2-py-oshima14.azurewebsites.net/`