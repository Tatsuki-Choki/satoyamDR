"""
イベント関連のテスト
"""
import pytest
from fastapi import status
from uuid import uuid4
from datetime import date, datetime, time


@pytest.fixture
def test_event(db):
    """テスト用イベント作成"""
    from db_control.models import Event as DbEvent, EventStatus
    
    event = DbEvent(
        id=str(uuid4()),
        title="テストイベント",
        description="これはテストイベントです",
        event_date=date.today(),
        start_time=time(10, 0),
        end_time=time(12, 0),
        location="テスト会場",
        capacity=10,
        fee=1000,
        status=EventStatus.reception,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def test_get_public_events(client, test_event):
    """パブリックイベント一覧取得テスト"""
    response = client.get("/api/events/upcoming")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_get_events(client, auth_headers, test_event):
    """イベント一覧取得テスト"""
    response = client.get("/events", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_get_event_detail(client, auth_headers, test_event):
    """イベント詳細取得テスト"""
    response = client.get(f"/events/{test_event.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == test_event.id
    assert response.json()["title"] == test_event.title


def test_register_for_event(client, auth_headers, test_event):
    """イベント参加登録テスト"""
    response = client.post(
        f"/events/{test_event.id}/register",
        headers=auth_headers,
        json={
            "dog_ids": []
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.json()


def test_cancel_event_registration(client, auth_headers, test_event):
    """イベント参加キャンセルテスト"""
    # まず登録
    client.post(
        f"/events/{test_event.id}/register",
        headers=auth_headers,
        json={"dog_ids": []}
    )
    
    # キャンセル
    response = client.delete(
        f"/events/{test_event.id}/register",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.json()


def test_get_event_participants(client, test_event):
    """イベント参加者一覧取得テスト"""
    response = client.get(f"/events/{test_event.id}/participants")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_admin_get_events(client, admin_auth_headers, test_event):
    """管理者用イベント一覧取得テスト"""
    response = client.get("/admin/events", headers=admin_auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_admin_create_event(client, admin_auth_headers):
    """管理者用イベント作成テスト"""
    response = client.post(
        "/admin/events",
        headers=admin_auth_headers,
        json={
            "title": "新しいイベント",
            "description": "イベントの説明",
            "event_date": str(date.today()),
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "イベント会場",
            "capacity": 20,
            "fee": 2000
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "新しいイベント"

