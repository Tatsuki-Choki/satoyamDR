"""
パフォーマンステスト（N+1問題の確認）
"""
import pytest
from uuid import uuid4
from datetime import datetime, date
from sqlalchemy import event
from sqlalchemy.engine import Engine


@pytest.fixture
def multiple_posts(db, test_user):
    """複数のテスト投稿を作成"""
    from db_control.models import Post as DbPost, Comment as DbComment, Like as DbLike
    
    posts = []
    for i in range(10):
        post = DbPost(
            id=str(uuid4()),
            user_id=test_user.id,
            content=f"テスト投稿{i}",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(post)
        posts.append(post)
    
    db.commit()
    
    # 各投稿にコメントといいねを追加
    for post in posts:
        comment = DbComment(
            id=str(uuid4()),
            post_id=post.id,
            user_id=test_user.id,
            content=f"コメント{post.id}",
            created_at=datetime.utcnow()
        )
        db.add(comment)
        
        like = DbLike(
            id=str(uuid4()),
            post_id=post.id,
            user_id=test_user.id,
            created_at=datetime.utcnow()
        )
        db.add(like)
    
    db.commit()
    return posts


@pytest.fixture
def multiple_events(db):
    """複数のテストイベントを作成"""
    from db_control.models import Event as DbEvent, EventRegistration, EventStatus
    
    events = []
    for i in range(5):
        event_obj = DbEvent(
            id=str(uuid4()),
            title=f"イベント{i}",
            description=f"イベント{i}の説明",
            event_date=date.today(),
            start_time=datetime.now().time(),
            end_time=datetime.now().time(),
            location=f"会場{i}",
            capacity=10,
            fee=1000,
            status=EventStatus.reception,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(event_obj)
        events.append(event_obj)
    
    db.commit()
    return events


def test_posts_feed_query_count(client, auth_headers, multiple_posts, db):
    """投稿フィード取得時のクエリ数を確認"""
    query_count = []
    
    @event.listens_for(Engine, "before_cursor_execute")
    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        query_count.append(statement)
    
    response = client.get("/posts/feed", headers=auth_headers)
    
    assert response.status_code == 200
    # N+1問題が解消されていれば、クエリ数は一定範囲内に収まる
    # 投稿10件に対して、以下のクエリが実行される：
    # 1. 投稿取得
    # 2. ユーザー情報取得（一括）
    # 3. 画像取得（一括）
    # 4. ハッシュタグ取得（一括）
    # 5. コメント数取得（一括）
    # 6. いいね数取得（一括）
    # 7. いいね状況取得（一括）
    # 合計で約7クエリ程度（N+1問題がなければ）
    assert len(query_count) <= 10  # 許容範囲内


def test_events_query_count(client, auth_headers, multiple_events, db):
    """イベント一覧取得時のクエリ数を確認"""
    query_count = []
    
    @event.listens_for(Engine, "before_cursor_execute")
    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        query_count.append(statement)
    
    response = client.get("/events", headers=auth_headers)
    
    assert response.status_code == 200
    # N+1問題が解消されていれば、クエリ数は一定範囲内に収まる
    # イベント5件に対して、以下のクエリが実行される：
    # 1. イベント取得
    # 2. 参加者数取得（一括）
    # 3. 登録状況取得（一括）
    # 合計で約3クエリ程度（N+1問題がなければ）
    assert len(query_count) <= 5  # 許容範囲内


def test_admin_posts_query_count(client, admin_auth_headers, multiple_posts, db):
    """管理者用投稿一覧取得時のクエリ数を確認"""
    query_count = []
    
    @event.listens_for(Engine, "before_cursor_execute")
    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        query_count.append(statement)
    
    response = client.get("/admin/posts", headers=admin_auth_headers)
    
    assert response.status_code == 200
    # N+1問題が解消されていれば、クエリ数は一定範囲内に収まる
    assert len(query_count) <= 10  # 許容範囲内

