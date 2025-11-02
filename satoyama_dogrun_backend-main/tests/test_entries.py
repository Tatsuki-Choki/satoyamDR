"""
入場管理関連のテスト
"""
import pytest
from fastapi import status
from uuid import uuid4
from datetime import datetime


@pytest.fixture
def test_dog(db, test_user):
    """テスト用犬作成"""
    from db_control.models import Dog as DbDog
    from datetime import date
    
    dog = DbDog(
        id=str(uuid4()),
        owner_id=test_user.id,
        name="テスト犬",
        breed="柴犬",
        birthday_at=date.today(),
        gender="オス",
        created_at=datetime.utcnow()
    )
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return dog


def test_generate_qr_code(client, auth_headers):
    """QRコード生成テスト"""
    response = client.get("/entry/qrcode", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "qr_code" in response.json()
    assert "user_id" in response.json()


def test_enter_dogrun(client, auth_headers, test_dog):
    """ドッグラン入場テスト"""
    response = client.post(
        "/entry/enter",
        headers=auth_headers,
        json={
            "dog_ids": [test_dog.id]
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "in_park"


def test_enter_dogrun_already_entered(client, auth_headers, test_dog):
    """既に入場中の状態で入場テスト（失敗）"""
    # まず入場
    client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    
    # 再度入場を試みる（失敗するはず）
    response = client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_exit_dogrun(client, auth_headers, test_dog):
    """ドッグラン退場テスト"""
    # まず入場
    client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    
    # 退場
    response = client.post("/entry/exit", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "duration_minutes" in response.json()


def test_exit_dogrun_no_entry(client, auth_headers):
    """入場記録なしで退場テスト（失敗）"""
    response = client.post("/entry/exit", headers=auth_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_current_visitors(client, auth_headers, test_dog):
    """現在の在場者一覧取得テスト"""
    # まず入場
    client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    
    response = client.get("/entry/current")
    assert response.status_code == status.HTTP_200_OK
    assert "total_visitors" in response.json()
    assert "visitors" in response.json()


def test_get_entry_history(client, auth_headers, test_dog):
    """入退場履歴取得テスト"""
    # 入場・退場を実行
    client.post(
        "/entry/enter",
        headers=auth_headers,
        json={"dog_ids": [test_dog.id]}
    )
    client.post("/entry/exit", headers=auth_headers)
    
    response = client.get("/entry/history", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 2  # 入場と退場の記録

