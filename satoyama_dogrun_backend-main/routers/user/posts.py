"""
投稿関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from uuid import uuid4
import shutil
import re
from sqlalchemy import func

from routers.shared import get_db, get_current_user
from db_control.models import (
    Post as DbPost, PostImage as DbPostImage, Comment as DbComment,
    Like as DbLike, Hashtag as DbHashtag, PostHashtag as DbPostHashtag,
    User as DbUser
)
from schemas import (
    PostDbResponse, PostDetailResponse, CreateCommentDbRequest, CommentDbResponse
)

# アップロード用ディレクトリ
POST_UPLOAD_DIR = Path("uploads") / "posts"
POST_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/posts", tags=["投稿"])


@router.get("", response_model=List[PostDbResponse])
async def get_posts(
    search: Optional[str] = None,
    db=Depends(get_db)
):
    """投稿一覧取得"""
    query = db.query(DbPost)
    if search:
        query = query.filter(DbPost.content.contains(search))
    
    posts = query.order_by(DbPost.created_at.desc()).all()
    
    if not posts:
        return []
    
    post_ids = [p.id for p in posts]
    
    # コメント数といいね数を一括取得
    comments_counts = {
        post_id: count
        for post_id, count in db.query(
            DbComment.post_id,
            func.count(DbComment.id)
        ).filter(DbComment.post_id.in_(post_ids)).group_by(DbComment.post_id).all()
    }
    
    likes_counts = {
        post_id: count
        for post_id, count in db.query(
            DbLike.post_id,
            func.count(DbLike.id)
        ).filter(DbLike.post_id.in_(post_ids)).group_by(DbLike.post_id).all()
    }
    
    responses: List[PostDbResponse] = []
    for p in posts:
        responses.append(PostDbResponse(
            id=p.id, user_id=p.user_id, content=p.content,
            created_at=p.created_at, updated_at=p.updated_at,
            comments_count=comments_counts.get(p.id, 0),
            likes_count=likes_counts.get(p.id, 0)
        ))
    return responses


@router.get("/feed", response_model=List[PostDetailResponse])
async def get_posts_feed(
    search: Optional[str] = None,
    hashtag: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """詳細な投稿フィード取得（画像、ハッシュタグ、ユーザー情報付き）"""
    query = db.query(DbPost)
    
    # ハッシュタグ検索
    if hashtag:
        hashtag_obj = db.query(DbHashtag).filter(DbHashtag.tag == hashtag).first()
        if hashtag_obj:
            post_ids = db.query(DbPostHashtag.post_id).filter(
                DbPostHashtag.hashtag_id == hashtag_obj.id
            ).subquery()
            query = query.filter(DbPost.id.in_(post_ids))
    
    # テキスト検索
    if search:
        query = query.filter(DbPost.content.contains(search))
    
    # ページネーション
    posts = query.order_by(DbPost.created_at.desc()).offset(offset).limit(limit).all()
    
    if not posts:
        return []
    
    post_ids = [post.id for post in posts]
    user_ids = list(set(post.user_id for post in posts))
    
    # ユーザー情報を一括取得
    users = {u.id: u for u in db.query(DbUser).filter(DbUser.id.in_(user_ids)).all()}
    
    # 画像URLを一括取得
    images_data = db.query(DbPostImage.post_id, DbPostImage.image_url).filter(
        DbPostImage.post_id.in_(post_ids)
    ).all()
    images_dict = {}
    for post_id, image_url in images_data:
        if post_id not in images_dict:
            images_dict[post_id] = []
        images_dict[post_id].append(image_url)
    
    # ハッシュタグを一括取得
    hashtags_data = db.query(
        DbPostHashtag.post_id,
        DbHashtag.tag
    ).join(DbHashtag, DbHashtag.id == DbPostHashtag.hashtag_id).filter(
        DbPostHashtag.post_id.in_(post_ids)
    ).all()
    hashtags_dict = {}
    for post_id, tag in hashtags_data:
        if post_id not in hashtags_dict:
            hashtags_dict[post_id] = []
        hashtags_dict[post_id].append(tag)
    
    # コメント数といいね数を一括取得
    comments_counts = {
        post_id: count
        for post_id, count in db.query(
            DbComment.post_id,
            func.count(DbComment.id)
        ).filter(DbComment.post_id.in_(post_ids)).group_by(DbComment.post_id).all()
    }
    
    likes_counts = {
        post_id: count
        for post_id, count in db.query(
            DbLike.post_id,
            func.count(DbLike.id)
        ).filter(DbLike.post_id.in_(post_ids)).group_by(DbLike.post_id).all()
    }
    
    # 現在のユーザーがいいねしている投稿を一括取得
    liked_post_ids = set(
        post_id for post_id, in db.query(DbLike.post_id).filter(
            DbLike.post_id.in_(post_ids),
            DbLike.user_id == current_user.id
        ).all()
    )
    
    responses: List[PostDetailResponse] = []
    for post in posts:
        user = users.get(post.user_id)
        user_name = f"{user.last_name or ''} {user.first_name or ''}".strip() if user else "不明なユーザー"
        
        responses.append(PostDetailResponse(
            id=post.id,
            user_id=post.user_id,
            user_name=user_name,
            user_avatar=user.avatar_url if user else None,
            content=post.content,
            images=images_dict.get(post.id, []),
            hashtags=hashtags_dict.get(post.id, []),
            created_at=post.created_at,
            updated_at=post.updated_at,
            comments_count=comments_counts.get(post.id, 0),
            likes_count=likes_counts.get(post.id, 0),
            is_liked=post.id in liked_post_ids
        ))
    
    return responses


@router.post("", response_model=PostDbResponse)
async def create_post(
    content: str = Form(...),
    hashtags: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """投稿作成 (画像アップロード・ハッシュタグ対応)"""
    # 投稿を作成
    post = DbPost(
        id=str(uuid4()),
        user_id=current_user.id,
        content=content,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(post)
    db.flush()  # IDを取得するためにflush
    
    # 画像アップロード処理
    if images:
        for image in images:
            if image.filename:
                # ファイル名を生成
                file_extension = Path(image.filename).suffix
                file_name = f"{uuid4()}{file_extension}"
                file_path = POST_UPLOAD_DIR / file_name
                
                # ファイルを保存
                with file_path.open("wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                
                # PostImageレコードを作成
                post_image = DbPostImage(
                    id=str(uuid4()),
                    post_id=post.id,
                    image_url=f"/uploads/posts/{file_name}"
                )
                db.add(post_image)
    
    # ハッシュタグ処理
    if hashtags:
        # カンマ区切りまたはスペース区切りのハッシュタグを処理
        tag_list = re.split(r'[,\s]+', hashtags)
        for tag_str in tag_list:
            if tag_str:
                # #を除去
                tag_name = tag_str.lstrip('#').strip()
                if tag_name:
                    # 既存のハッシュタグを検索または作成
                    hashtag = db.query(DbHashtag).filter(DbHashtag.tag == tag_name).first()
                    if not hashtag:
                        hashtag = DbHashtag(
                            id=str(uuid4()),
                            tag=tag_name
                        )
                        db.add(hashtag)
                        db.flush()
                    
                    # PostHashtagリレーションを作成
                    post_hashtag = DbPostHashtag(
                        id=str(uuid4()),
                        post_id=post.id,
                        hashtag_id=hashtag.id
                    )
                    db.add(post_hashtag)
    
    db.commit()
    db.refresh(post)
    
    return PostDbResponse(
        id=post.id, user_id=post.user_id, content=post.content,
        created_at=post.created_at, updated_at=post.updated_at,
        comments_count=0, likes_count=0
    )


@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """投稿にいいね"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    # 既存のいいねを確認
    exists = db.query(DbLike).filter(
        DbLike.post_id == post_id, 
        DbLike.user_id == current_user.id
    ).first()
    
    if exists:
        return {"message": "すでにいいねしています", "liked": True}
    
    # 新しいいいねを追加
    like = DbLike(
        id=str(uuid4()), 
        post_id=post_id, 
        user_id=current_user.id, 
        created_at=datetime.utcnow()
    )
    db.add(like)
    db.commit()
    
    # いいね数を取得
    likes_count = db.query(DbLike).filter(DbLike.post_id == post_id).count()
    
    return {
        "message": "いいねしました", 
        "liked": True,
        "likes_count": likes_count
    }


@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """いいねを解除"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    like = db.query(DbLike).filter(
        DbLike.post_id == post_id, 
        DbLike.user_id == current_user.id
    ).first()
    
    if not like:
        return {"message": "いいねしていません", "liked": False}
    
    db.delete(like)
    db.commit()
    
    # いいね数を取得
    likes_count = db.query(DbLike).filter(DbLike.post_id == post_id).count()
    
    return {
        "message": "いいねを解除しました", 
        "liked": False,
        "likes_count": likes_count
    }


@router.get("/{post_id}/comments", response_model=List[CommentDbResponse])
async def get_comments(
    post_id: str,
    db=Depends(get_db)
):
    """投稿のコメント一覧取得"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    comments = db.query(DbComment).filter(
        DbComment.post_id == post_id
    ).order_by(DbComment.created_at.desc()).all()
    
    result = []
    for comment in comments:
        # ユーザー情報を取得
        user = db.query(DbUser).filter(DbUser.id == comment.user_id).first()
        user_name = None
        if user:
            user_name = f"{user.first_name} {user.last_name}".strip() if user.first_name or user.last_name else None
        
        result.append(CommentDbResponse(
            id=comment.id,
            post_id=comment.post_id,
            user_id=comment.user_id,
            user_name=user_name,
            content=comment.content,
            created_at=comment.created_at
        ))
    
    return result


@router.post("/{post_id}/comments", response_model=CommentDbResponse)
async def add_comment(
    post_id: str,
    request: CreateCommentDbRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """コメント追加"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    comment = DbComment(
        id=str(uuid4()),
        content=request.content,
        post_id=post_id,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # ユーザー名を取得
    user_name = f"{current_user.first_name} {current_user.last_name}".strip() if current_user.first_name or current_user.last_name else None
    
    return CommentDbResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        user_name=user_name,
        content=comment.content,
        created_at=comment.created_at,
    )

