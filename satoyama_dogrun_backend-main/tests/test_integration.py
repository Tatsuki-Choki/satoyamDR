"""
統合テスト
"""
import pytest
from fastapi import status
from uuid import uuid4
from datetime import datetime, date


def test_user_registration_flow(client, db):
    """ユーザー登録からログインまでのフロー"""
    # 申請を送信（実際にはファイルアップロードが必要だが、簡略化）
    # 注: 実際のテストではファイルアップロードも含める必要がある
    
    # ログイン（申請が承認された後）
    # 実際のテストでは申請承認プロセスも含める必要がある
    pass


def test_post_creation_and_interaction(client, auth_headers, test_user):
    """投稿作成からいいね・コメントまでのフロー"""
    # 投稿作成
    create_response = client.post(
        "/posts",
        headers=auth_headers,
        data={"content": "統合テスト用の投稿"}
    )
    assert create_response.status_code == status.HTTP_200_OK
    post_id = create_response.json()["id"]
    
    # いいね
    like_response = client.post(
        f"/posts/{post_id}/like",
        headers=auth_headers
    )
    assert like_response.status_code == status.HTTP_200_OK
    
    # コメント追加
    comment_response = client.post(
        f"/posts/{post_id}/comments",
        headers=auth_headers,
        json={"content": "統合テスト用のコメント"}
    )
    assert comment_response.status_code == status.HTTP_200_OK
    
    # コメント一覧取得
    comments_response = client.get(f"/posts/{post_id}/comments")
    assert comments_response.status_code == status.HTTP_200_OK
    assert len(comments_response.json()) > 0


def test_event_registration_flow(client, auth_headers, test_event):
    """イベント登録からキャンセルまでのフロー"""
    # イベント登録
    register_response = client.post(
        f"/events/{test_event.id}/register",
        headers=auth_headers,
        json={"dog_ids": []}
    )
    assert register_response.status_code == status.HTTP_200_OK
    
    # イベント詳細取得（登録状況確認）
    detail_response = client.get(f"/events/{test_event.id}", headers=auth_headers)
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["is_registered"] is True
    
    # キャンセル
    cancel_response = client.delete(
        f"/events/{test_event.id}/register",
        headers=auth_headers
    )
    assert cancel_response.status_code == status.HTTP_200_OK
    
    # 再度イベント詳細取得（登録解除確認）
    detail_response2 = client.get(f"/events/{test_event.id}", headers=auth_headers)
    assert detail_response2.status_code == status.HTTP_200_OK
    assert detail_response2.json()["is_registered"] is False


def test_entry_flow(client, auth_headers, test_dog):
    """入場から退場までのフロー"""
    # 入場
    enter_response = client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    assert enter_response.status_code == status.HTTP_200_OK
    assert enter_response.json()["status"] == "in_park"
    
    # 現在の在場者確認
    current_response = client.get("/entry/current")
    assert current_response.status_code == status.HTTP_200_OK
    assert current_response.json()["total_visitors"] > 0
    
    # 履歴確認
    history_response = client.get("/entry/history", headers=auth_headers)
    assert history_response.status_code == status.HTTP_200_OK
    assert len(history_response.json()) > 0
    
    # 退場
    exit_response = client.post("/entry/exit", headers=auth_headers)
    assert exit_response.status_code == status.HTTP_200_OK
    assert "duration_minutes" in exit_response.json()


def test_admin_application_approval_flow(client, admin_auth_headers, db):
    """管理者による申請承認フロー"""
    from db_control.models import Application, ApplicationStatus
    from datetime import datetime
    from auth import get_password_hash
    
    # 申請を作成
    application = Application(
        id=str(uuid4()),
        user_id=None,
        user_email="newuser@example.com",
        user_password_hash=get_password_hash("password123"),
        user_last_name="新規",
        user_first_name="ユーザー",
        user_phone="090-9999-9999",
        user_address="テスト住所",
        user_prefecture="愛媛県",
        user_city="今治市",
        dog_name="テスト犬",
        dog_breed="柴犬",
        dog_weight="10kg",
        status=ApplicationStatus.pending,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(application)
    db.commit()
    
    # 申請一覧取得
    list_response = client.get("/admin/applications", headers=admin_auth_headers)
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) > 0
    
    # 申請承認
    approve_response = client.put(
        f"/admin/applications/{application.id}/approve",
        headers=admin_auth_headers,
        json={"admin_notes": "承認しました"}
    )
    assert approve_response.status_code == status.HTTP_200_OK
    
    # 承認後の申請詳細確認
    detail_response = client.get(
        f"/admin/applications/{application.id}",
        headers=admin_auth_headers
    )
    assert detail_response.status_code == status.HTTP_200_OK
    assert detail_response.json()["status"] == ApplicationStatus.approved.value

