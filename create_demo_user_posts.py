import sys
import os
sys.path.append('satoyama_dogrun_backend-main')

from sqlalchemy.orm import sessionmaker
from database import engine
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

# デモユーザー情報
DEMO_USER = {
    "email": "demo@example.com",
    "last_name": "デモ",
    "first_name": "太郎",
    "phone": "090-0000-0000",
    "password": "demo123"
}

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
    }
]

# コメントテンプレート
comment_templates = [
    "うちも{brand}使ってます！本当に良いフードですよね。",
    "{brand}気になってました！参考になります。",
    "良さそうですね！今度試してみます。",
    "うちの子も{brand}大好きです！",
    "詳しい情報ありがとうございます！"
]

def create_demo_user_and_posts():
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        print("🐕 デモユーザー用の架空のドッグフードブランドに関する投稿を作成します...")
        
        # 1. デモユーザーの作成または取得
        demo_user = db.query(DbUser).filter(DbUser.email == DEMO_USER["email"]).first()
        if demo_user:
            print(f"✅ 既存デモユーザー: {DEMO_USER['last_name']}{DEMO_USER['first_name']}")
        else:
            # 新規デモユーザー作成
            demo_user = DbUser(
                id=str(uuid.uuid4()),
                email=DEMO_USER["email"],
                last_name=DEMO_USER["last_name"],
                first_name=DEMO_USER["first_name"],
                phone_number=DEMO_USER["phone"],
                password_hash=get_password_hash(DEMO_USER["password"]),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"✅ デモユーザー作成: {DEMO_USER['last_name']}{DEMO_USER['first_name']}")
        
        # 他のユーザーも取得（コメント用）
        other_users = db.query(DbUser).filter(DbUser.id != demo_user.id).limit(5).all()
        
        # 2. デモユーザーの投稿を作成
        post_count = 0
        for template in post_templates[:5]:  # 最初の5つのテンプレートを使用
            for brand in FICTIONAL_BRANDS:
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
                
                # 投稿を作成
                # タイトルを内容の最初に含める
                full_content = f"【{title}】\n\n{content}"
                new_post = DbPost(
                    id=str(uuid.uuid4()),
                    user_id=demo_user.id,
                    content=full_content,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(new_post)
                post_count += 1
                print(f"📝 投稿 {post_count}: 「{title}」を作成しました")
                
                # 30%の確率で他のユーザーからコメントも追加
                if random.random() > 0.7 and other_users:
                    comment_user = random.choice(other_users)
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
        print("デモユーザーの投稿データをコミットしました")
        
        print(f"\n✨ 完了！デモユーザー用に {post_count} 件の投稿を作成しました。")
        print("\nデモアカウントでログインしてください：")
        print(f"  メール: {DEMO_USER['email']}")
        print(f"  パスワード: {DEMO_USER['password']}")
        print("\nブラウザで http://localhost:3000 を開いて「デモで試す」ボタンをクリックしてください。")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user_and_posts()