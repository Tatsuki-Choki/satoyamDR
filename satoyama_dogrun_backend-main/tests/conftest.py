"""
pytest設定とフィクスチャ
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

# テスト用の環境変数を設定（SECRET_KEY検証を回避）
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["ENVIRONMENT"] = "test"

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base, get_db
from db_control.models import Base as DbBase

# テスト用のSQLiteデータベース
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """テスト用データベースセッション"""
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    DbBase.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # テーブルを削除
        Base.metadata.drop_all(bind=engine)
        DbBase.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """テスト用クライアント"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """テスト用ユーザー作成"""
    from uuid import uuid4
    from datetime import datetime
    from db_control.models import User
    from auth import get_password_hash
    
    user = User(
        id=str(uuid4()),
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        last_name="テスト",
        first_name="ユーザー",
        phone_number="090-1234-5678",
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin_user(db):
    """テスト用管理者ユーザー作成"""
    from uuid import uuid4
    from datetime import datetime
    from db_control.models import AdminUser, AdminRole
    from auth import get_password_hash
    
    admin_user = AdminUser(
        id=str(uuid4()),
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        last_name="管理者",
        first_name="テスト",
        role=AdminRole.admin,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


@pytest.fixture
def auth_headers(client, test_user):
    """認証ヘッダー"""
    response = client.post("/auth/login", json={
        "email": test_user.email,
        "password": "testpassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(client, test_admin_user):
    """管理者認証ヘッダー"""
    response = client.post("/admin/auth/login", json={
        "email": test_admin_user.email,
        "password": "adminpassword123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

