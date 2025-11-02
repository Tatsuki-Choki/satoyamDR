"""
管理者関連のテスト
"""
import pytest
from fastapi import status
from uuid import uuid4
from datetime import datetime


def test_admin_get_dashboard_stats(client, admin_auth_headers):
    """ダッシュボード統計取得テスト"""
    response = client.get("/admin/dashboard/stats", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "total_users" in response.json()
    assert "total_dogs" in response.json()
    assert "pending_applications" in response.json()


def test_admin_get_users(client, admin_auth_headers, test_user):
    """管理者用ユーザー一覧取得テスト"""
    response = client.get("/admin/users", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_admin_get_user_detail(client, admin_auth_headers, test_user):
    """管理者用ユーザー詳細取得テスト"""
    response = client.get(f"/admin/users/{test_user.id}", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == test_user.id


def test_admin_get_applications(client, admin_auth_headers):
    """管理者用申請一覧取得テスト"""
    response = client.get("/admin/applications", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_admin_get_posts_stats(client, admin_auth_headers):
    """管理者用投稿統計取得テスト"""
    response = client.get("/admin/posts/stats", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "total" in response.json()
    assert "pending" in response.json()


def test_admin_get_events_stats(client, admin_auth_headers):
    """管理者用イベント統計取得テスト"""
    response = client.get("/admin/events/stats", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "total_events" in response.json()
    assert "upcoming_events" in response.json()

