# 里山ドッグラン - フロントエンド

里山ドッグラン管理システムのフロントエンド（Next.js）です。

## 技術スタック

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **HTTP Client**: Axios
- **State Management**: React Hooks

## プロジェクト構造

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # React コンポーネント
│   ├── ui/               # 再利用可能なUIコンポーネント
│   ├── modals/           # モーダルコンポーネント
│   └── sections/         # ページセクション
├── lib/                  # ユーティリティ・API
│   ├── api.ts           # API クライアント
│   ├── constants.ts     # 定数定義
│   ├── types.ts         # TypeScript型定義
│   └── utils.ts         # ユーティリティ関数
├── hooks/               # カスタムフック
└── public/              # 静的ファイル
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp env.local.example .env.local
```

`.env.local`ファイルを編集して、バックエンドAPIのURLを設定：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 起動コマンド

### 開発サーバー起動
```bash
cd satoyama_dogrun_frontend
npm run dev
```

### 本番ビルド
```bash
npm run build
npm run start
```

### 依存関係のインストール（初回のみ）
```bash
npm install
```

## 開発ガイドライン

### コンポーネント設計

- **Atomic Design**: atoms → molecules → organisms → templates → pages
- **Props Interface**: すべてのコンポーネントで型定義を行う
- **Default Props**: 適切なデフォルト値を設定

### 状態管理

- **Local State**: useState, useReducer
- **Global State**: Context API（必要に応じて）
- **Server State**: API クライアント（Axios）

### スタイリング

- **Tailwind CSS**: ユーティリティファースト
- **CSS Modules**: 必要に応じて
- **Responsive Design**: モバイルファースト

### エラーハンドリング

- **Try-Catch**: API呼び出しでのエラーハンドリング
- **Error Boundaries**: React エラーバウンダリ
- **Loading States**: 適切なローディング状態

## ビルド・デプロイ

### 開発ビルド

```bash
npm run build
```

### 本番ビルド

```bash
npm run build
npm run start
```

## テスト

```bash
npm run lint
```

## ライセンス

MIT License 