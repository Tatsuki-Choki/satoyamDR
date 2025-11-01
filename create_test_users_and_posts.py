import sys
import os
sys.path.append('satoyama_dogrun_backend-main')

from sqlalchemy.orm import Session
from database import engine, get_db
from db_control.models import User as DbUser, Post as DbPost, Comment as DbComment
from auth import get_password_hash
from datetime import datetime
import random
import uuid

# 架空のドッグフードブランド名
FICTIONAL_BRANDS = [
    "ワンワンデライト",
    "パピーズドリーム", 
    "健康わんこ食堂",
    "愛犬のごちそう",
    "ナチュラルテイル",
]

# テストユーザー情報
test_users = [
    {"email": "tanaka@example.com", "last_name": "田中", "first_name": "太郎", "phone": "090-1111-1111"},
    {"email": "sato@example.com", "last_name": "佐藤", "first_name": "花子", "phone": "090-2222-2222"},
    {"email": "suzuki@example.com", "last_name": "鈴木", "first_name": "一郎", "phone": "090-3333-3333"},
    {"email": "yamada@example.com", "last_name": "山田", "first_name": "美咲", "phone": "090-4444-4444"},
    {"email": "takahashi@example.com", "last_name": "高橋", "first_name": "健太", "phone": "090-5555-5555"},
]

# 投稿テンプレート
post_templates = [
    {
        "title": "うちの子のお気に入り！{brand}のプレミアムフード",
        "content": "最近{brand}のプレミアムフードに変えてから、毛並みがツヤツヤになりました！食いつきも抜群で、お皿がピカピカになるまで食べてくれます。特に{flavor}味がお気に入りみたいです。",
        "flavors": ["チキン＆野菜", "サーモン＆ポテト", "ラム＆ライス", "ビーフ＆かぼちゃ"]
    },
    {
        "title": "{brand}に変えてから体調が良くなりました", 
        "content": "獣医さんに勧められて{brand}を試してみたら、{dog_name}の体調がすごく良くなりました。{benefit}が改善されて、散歩も元気いっぱいです！小粒で食べやすいのも良いですね。",
        "dog_names": ["ポチ", "コロ", "モモ", "チョコ", "マロン"],
        "benefits": ["お腹の調子", "関節の動き", "皮膚のかゆみ", "体重管理"]
    },
    {
        "title": "{brand}のグレインフリーフードを試してみました",
        "content": "アレルギー体質の{dog_name}のために{brand}のグレインフリーを購入。穀物不使用で{protein}がメインなので安心です。価格は少し高めですが、健康を考えれば納得の品質です。",
        "dog_names": ["ハナ", "リン", "ムギ", "ココ", "ナナ"],
        "proteins": ["鹿肉", "七面鳥", "白身魚", "鴨肉"]
    },
    {
        "title": "シニア犬にも優しい{brand}",
        "content": "13歳になる{dog_name}のために{brand}のシニア用を選びました。関節サポート成分と消化しやすい原材料で、老犬でも美味しく食べられるみたい。{feature}なのも嬉しいポイント。",
        "dog_names": ["タロウ", "ジロウ", "サクラ", "ユキ"],
        "features": ["低カロリー", "オメガ3配合", "グルコサミン入り", "ソフトタイプ"]
    },
    {
        "title": "{brand}のパピー用フード、成長期にぴったり！",
        "content": "生後{months}ヶ月の{dog_name}に{brand}のパピー用をあげています。栄養バランスが良くて、{development}がしっかりしてきました。小分けパックなのも便利です。",
        "months": [3, 4, 5, 6],
        "dog_names": ["ミルク", "クッキー", "プリン", "マカロン"],
        "developments": ["骨格", "筋肉", "毛並み", "歯"]
    },
    {
        "title": "{brand}のウェットフードもおすすめ",
        "content": "ドライフードが苦手な{dog_name}に{brand}のウェットフードを混ぜてあげたら完食！{texture}で香りも良く、水分補給にもなります。トッピングとしても使えて便利。",
        "dog_names": ["ベル", "ミント", "ローズ", "ジャスミン"],
        "textures": ["ペースト状", "チャンク入り", "ゼリー仕立て", "シチュータイプ"]
    },
    {
        "title": "里山ドッグランで{brand}の試食会に参加しました",
        "content": "先週の試食会で{brand}の新商品を試せました！{dog_name}も他のワンちゃんたちも大喜び。{special_feature}が特徴的で、今度買ってみようと思います。",
        "dog_names": ["バロン", "プリンス", "デューク", "アール"],
        "special_features": ["フリーズドライ製法", "国産原材料100%", "ヒューマングレード", "オーガニック認証"]
    },
    {
        "title": "{brand}に変えてから食べムラが改善",
        "content": "食べムラがひどかった{dog_name}が{brand}なら完食するように！{reason}が決め手みたいです。ローテーションで{variety}種類の味を楽しんでいます。",
        "dog_names": ["ティアラ", "ジュエル", "パール", "ルビー"],
        "reasons": ["粒の大きさ", "香りの強さ", "食感", "温度"],
        "varieties": [3, 4, 5]
    }
]

# コメントテンプレート
comment_templates = [
    "うちも{brand}使ってます！本当に良いフードですよね。",
    "{brand}気になってました！参考になります。",
    "良さそうですね！今度試してみます。",
    "うちの子も{brand}大好きです！",
    "詳しい情報ありがとうございます！",
    "{brand}のサンプルもらって試したことあります。確かに食いつき良かったです！",
    "毛並みが良くなるの魅力的ですね✨",
    "シニア用もあるんですね！うちの子も高齢なので検討してみます。",
    "グレインフリーは安心ですよね。アレルギー対策は大切。",
    "試食会楽しそう！次回は参加したいです。"
]

def create_users_and_posts():
    from sqlalchemy.orm import sessionmaker
    from database import engine
    
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        print("🐕 架空のドッグフードブランドに関する投稿を作成します...")
        
        # 1. テストユーザーの作成
        created_users = []
        for user_data in test_users:
            # 既存ユーザーをチェック
            existing_user = db.query(DbUser).filter(DbUser.email == user_data["email"]).first()
            if existing_user:
                print(f"✅ 既存ユーザー: {user_data['last_name']}{user_data['first_name']}")
                created_users.append(existing_user)
            else:
                # 新規ユーザー作成
                new_user = DbUser(
                    id=str(uuid.uuid4()),
                    email=user_data["email"],
                    last_name=user_data["last_name"],
                    first_name=user_data["first_name"],
                    phone_number=user_data["phone"],
                    password_hash=get_password_hash("password123"),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(new_user)
                created_users.append(new_user)
                print(f"✅ 新規ユーザー作成: {user_data['last_name']}{user_data['first_name']}")
        
        # ユーザー作成をコミット
        db.commit()
        print("ユーザーデータをコミットしました")
        
        # 2. 投稿の作成
        post_count = 0
        for template in post_templates:
            for brand in FICTIONAL_BRANDS:
                # ランダムにユーザーを選択
                user = random.choice(created_users)
                
                # タイトルと内容を生成
                title = template["title"].format(brand=brand)
                content = template["content"]
                
                # プレースホルダーを置換
                if "flavors" in template:
                    content = content.format(
                        brand=brand,
                        flavor=random.choice(template["flavors"])
                    )
                elif "dog_names" in template and "benefits" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        benefit=random.choice(template["benefits"])
                    )
                elif "dog_names" in template and "proteins" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        protein=random.choice(template["proteins"])
                    )
                elif "dog_names" in template and "features" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        feature=random.choice(template["features"])
                    )
                elif "months" in template:
                    content = content.format(
                        brand=brand,
                        months=random.choice(template["months"]),
                        dog_name=random.choice(template["dog_names"]),
                        development=random.choice(template["developments"])
                    )
                elif "textures" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        texture=random.choice(template["textures"])
                    )
                elif "special_features" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        special_feature=random.choice(template["special_features"])
                    )
                elif "reasons" in template:
                    content = content.format(
                        brand=brand,
                        dog_name=random.choice(template["dog_names"]),
                        reason=random.choice(template["reasons"]),
                        variety=random.choice(template["varieties"])
                    )
                else:
                    content = content.format(brand=brand)
                
                # 投稿を作成
                # タイトルを内容の最初に含める
                full_content = f"【{title}】\n\n{content}"
                new_post = DbPost(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    content=full_content,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(new_post)
                post_count += 1
                print(f"📝 投稿 {post_count}: 「{title}」を作成しました")
                
                # 50%の確率でコメントも追加
                if random.random() > 0.5 and len(created_users) > 1:
                    # 別のユーザーからコメント
                    comment_user = random.choice([u for u in created_users if u.id != user.id])
                    comment_content = random.choice(comment_templates).format(brand=brand)
                    
                    new_comment = DbComment(
                        id=str(uuid.uuid4()),
                        post_id=new_post.id,
                        user_id=comment_user.id,
                        content=comment_content,
                        created_at=datetime.now()
                    )
                    db.add(new_comment)
                    print(f"  💬 コメントを追加しました")
        
        # 投稿とコメントをコミット
        db.commit()
        print("投稿データをコミットしました")
        
        print(f"\n✨ 完了！合計 {post_count} 件の投稿を作成しました。")
        print("ブラウザで http://localhost:3000 を開いて投稿を確認してください。")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users_and_posts()