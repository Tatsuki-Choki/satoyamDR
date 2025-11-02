"""
認証関連のテスト
"""
import pytest
from fastapi import status


def test_user_login_success(client, test_user):
    """ユーザーログイン成功テスト"""
    response = client.post("/auth/login", json={
        "email": test_user.email,
        "password": "testpassword123"
    })
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_user_login_failure(client, test_user):
    """ユーザーログイン失敗テスト（間違ったパスワード）"""
    response = client.post("/auth/login", json={
        "email": test_user.email,
        "password": "wrongpassword"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_user_login_user_not_found(client):
    """ユーザーログイン失敗テスト（ユーザー不存在）"""
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_admin_login_success(client, test_admin_user):
    """管理者ログイン成功テスト"""
    response = client.post("/admin/auth/login", json={
        "email": test_admin_user.email,
        "password": "adminpassword123"
    })
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert "admin_user" in response.json()


def test_get_current_user(client, auth_headers):
    """現在のユーザー情報取得テスト"""
    response = client.get("/users/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "email" in response.json()


def test_get_current_user_unauthorized(client):
    """認証なしでユーザー情報取得テスト（失敗）"""
    response = client.get("/users/me")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_current_admin(client, admin_auth_headers):
    """現在の管理者情報取得テスト"""
    response = client.get("/admin/auth/me", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "email" in response.json()

