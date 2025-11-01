# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発作業の進め方

### コミュニケーション言語
- **すべてのやり取りは日本語で行ってください**
- コメント、説明、エラーメッセージの報告、質問など、ユーザーとのコミュニケーションはすべて日本語を使用
- コード内のコメントは既存のコードスタイルに従う（英語のままでOK）

### 自律的な作業実行
- **許可不要な作業**: 重大なリスクがない限り、以下の作業は許可を取らずに実行してください：
  - コーディング作業全般（新規ファイル作成、既存ファイルの編集）
  - 開発サーバーの起動（backend/frontend両方）
  - テストの実行
  - 依存関係のインストール
  - ファイルの読み取りや検索
  - デバッグとエラー修正
  - リファクタリング

### 許可が必要な作業
以下の場合のみ、実行前に確認を取ってください：
- データベースの削除や大規模なマイグレーション
- 本番環境へのデプロイ
- 外部サービスのAPIキーや認証情報の変更
- システム全体のアーキテクチャ変更
- `rm -rf` などの破壊的なコマンド実行
- 大量のデータ削除を伴う操作

## Project Overview
This is a full-stack dog park management system called "里山ドッグラン" (Satoyama Dog Run) with a FastAPI backend and Next.js frontend.

## Project Structure
```
里山ドッグラン5/
├── satoyama_dogrun_backend-main/    # FastAPI backend
│   ├── main.py                      # Main application entry
│   ├── auth.py                      # Authentication (JWT)
│   ├── database.py                  # Database connection
│   ├── schemas.py                   # Pydantic schemas
│   ├── db_control/                  # Database models & utilities
│   │   ├── models.py               # SQLAlchemy models
│   │   └── initialize_db.py       # DB initialization scripts
│   └── uploads/                    # File uploads directory
└── satoyama_dogrun_frontend-main/   # Next.js frontend
    ├── app/                         # Next.js App Router pages
    │   └── admin/                  # Admin panel pages
    ├── components/                  # React components
    │   ├── ui/                     # Radix UI components
    │   └── modals/                 # Modal components
    ├── lib/                        # Utilities & API client
    │   ├── api.ts                  # API client (Axios)
    │   └── types.ts               # TypeScript types
    └── hooks/                      # Custom React hooks
```

## Development Commands

### Backend (FastAPI)
```bash
# Navigate to backend
cd satoyama_dogrun_backend-main

# Activate virtual environment
source venv_mac/bin/activate  # macOS
source venv/bin/activate       # New environment

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
python -m pytest tests/
```

### Frontend (Next.js)
```bash
# Navigate to frontend
cd satoyama_dogrun_frontend-main

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run linter
npm run lint
```

## Key Architecture Patterns

### Backend Architecture
- **Framework**: FastAPI with automatic API documentation (Swagger/ReDoc)
- **Database**: SQLAlchemy ORM with SQLite (dev) / PostgreSQL/MySQL (prod)
- **Authentication**: JWT tokens with HTTPBearer security
- **File Uploads**: Multipart form handling for images and certificates
- **CORS**: Configured for cross-origin requests from frontend

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom theme configuration
- **API Communication**: Axios client with centralized API configuration
- **Authentication**: JWT token storage and management

## API Endpoints Structure
- `/auth/*` - User authentication (login, register)
- `/admin/*` - Admin authentication and management
- `/api/users/*` - User profile management
- `/api/dogs/*` - Dog registration and management  
- `/api/posts/*` - Social feed posts
- `/api/events/*` - Event management
- `/api/entries/*` - Entry/exit QR code scanning
- `/api/applications/*` - Dog park applications

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./satoyama_dogrun.db
SECRET_KEY=your-secret-key-here
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Models
Key models include:
- `User`, `AdminUser` - User accounts
- `Dog`, `VaccinationRecord` - Dog profiles and health records
- `Post`, `Comment`, `Like` - Social features
- `Event`, `EventRegistration` - Event management
- `Application` - Dog park membership applications
- `EntryLog` - Entry/exit tracking
- `BusinessHour`, `SpecialHoliday`, `SystemSetting` - System configuration

## Testing Approach
- Backend: Use pytest for API testing (`python -m pytest`)
- Frontend: No test framework currently configured
- Test files follow `test_*.py` naming convention in backend

## Azure Deployment
- Frontend deployed to: `https://app-002-gen10-step3-2-node-oshima14.azurewebsites.net`
- Backend deployed to: `https://app-002-gen10-step3-2-py-oshima14.azurewebsites.net`
- Uses Azure App Service with appropriate CORS configuration