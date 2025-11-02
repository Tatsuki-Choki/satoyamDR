"""
投稿関連のテスト
"""
import pytest
from fastapi import status
from uuid import uuid4
from datetime import datetime


@pytest.fixture
def test_post(db, test_user):
    """テスト用投稿作成"""
    from db_control.models import Post as DbPost
    
    post = DbPost(
        id=str(uuid4()),
        user_id=test_user.id,
        content="テスト投稿です",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def test_get_posts(client):
    """投稿一覧取得テスト"""
    response = client.get("/posts")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_get_posts_feed(client, auth_headers, test_post):
    """投稿フィード取得テスト"""
    response = client.get("/posts/feed", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_create_post(client, auth_headers):
    """投稿作成テスト"""
    response = client.post(
        "/posts",
        headers=auth_headers,
        data={
            "content": "新しい投稿です"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["content"] == "新しい投稿です"


def test_like_post(client, auth_headers, test_post):
    """投稿いいねテスト"""
    response = client.post(
        f"/posts/{test_post.id}/like",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["liked"] is True


def test_unlike_post(client, auth_headers, test_post):
    """投稿いいね解除テスト"""
    # まずいいねを追加
    client.post(f"/posts/{test_post.id}/like", headers=auth_headers)
    
    # いいねを解除
    response = client.delete(
        f"/posts/{test_post.id}/like",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["liked"] is False


def test_add_comment(client, auth_headers, test_post):
    """コメント追加テスト"""
    response = client.post(
        f"/posts/{test_post.id}/comments",
        headers=auth_headers,
        json={
            "content": "テストコメントです"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["content"] == "テストコメントです"


def test_get_comments(client, test_post):
    """コメント一覧取得テスト"""
    response = client.get(f"/posts/{test_post.id}/comments")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_admin_get_posts(client, admin_auth_headers, test_post):
    """管理者用投稿一覧取得テスト"""
    response = client.get("/admin/posts", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

