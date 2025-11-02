from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv

# データベースとルーター関連のインポート
from database import engine, Base
from db_control.models import Base as DbBase

load_dotenv()

app = FastAPI(
    title="里山ドッグラン API",
    description="里山ドッグランの管理システムAPI",
    version="1.0.0"
)

# CORS設定
default_origins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3003,https://app-002-gen10-step3-2-node-oshima14.azurewebsites.net"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", default_origins)
allowed_origins = allowed_origins_env.split(",")
# 空文字列を除去してクリーンなリストを作成
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

# 本番環境ではワイルドカードを許可しない
is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
if is_production and "*" in allowed_origins:
    raise ValueError("本番環境ではCORSのワイルドカード(*)は許可できません。ALLOWED_ORIGINSに具体的なオリジンを設定してください。")

# レスポンス圧縮ミドルウェア（パフォーマンス最適化）
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not is_production else allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# アップロード用ディレクトリの作成
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
POST_UPLOAD_DIR = UPLOAD_DIR / "posts"
POST_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VACCINE_CERTIFICATE_UPLOAD_DIR = UPLOAD_DIR / "vaccine_certificates"
VACCINE_CERTIFICATE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Static filesのマウント
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# データベース初期化（環境変数で制御）
if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
    Base.metadata.create_all(bind=engine)
# db_control のテーブル作成を個別に有効化（初回のみ true 推奨）
if os.getenv("AUTO_CREATE_DB_CONTROL_TABLES", "false").lower() == "true":
    DbBase.metadata.create_all(bind=engine)

# ===== ルーターのインポートと登録 =====
from routers.user import user_router
from routers.admin import admin_router

# ルーターを登録
app.include_router(user_router)
app.include_router(admin_router)

# ===== 管理者用APIエンドポイント =====
# 注意: 全ての管理者用エンドポイントはルーターに移行済みです
# 以下のエンドポイントは削除されました（ルーターに移行済み）:
# - /admin/auth/* -> routers/admin/auth.py
# - /admin/applications/* -> routers/admin/applications.py
# - /admin/dashboard/* -> routers/admin/dashboard.py
# - /admin/users/* -> routers/admin/users.py
# - /admin/events/* -> routers/admin/events.py
# - /admin/posts/* -> routers/admin/posts.py
# - /admin/business-hours/* -> routers/admin/settings.py
# - /admin/special-holidays/* -> routers/admin/settings.py
# - /admin/settings/* -> routers/admin/settings.py
# - /admin/dogs -> routers/admin/users.py (ユーザーの犬一覧として実装)

# ===== ユーザー側APIエンドポイント =====
# 注意: 全てのユーザー側エンドポイントはルーターに移行済みです
# 以下のエンドポイントは削除されました（ルーターに移行済み）:
# - /auth/* -> routers/user/auth.py
# - /users/* -> routers/user/profile.py
# - /dogs/* -> routers/user/profile.py
# - /posts/* -> routers/user/posts.py
# - /events/* -> routers/user/events.py
# - /entry/* -> routers/user/entry.py
# - /api/events/upcoming -> routers/user/events.py
# - /calendar/{year}/{month} -> routers/user/events.py
# - /notices/* -> 今後ルーターに移行可能
# - /tags -> 今後ルーターに移行可能

# ヘルスチェック
@app.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
