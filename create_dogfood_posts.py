import requests
import json
from datetime import datetime, timedelta
import random

# APIのベースURL
BASE_URL = "http://localhost:8000"

# テストユーザーのログイン情報
test_users = [
    {"email": "user1@example.com", "password": "password123"},
    {"email": "user2@example.com", "password": "password123"},
    {"email": "user3@example.com", "password": "password123"},
]

# 架空のドッグフードブランド名
FICTIONAL_BRANDS = [
    "ワンワンデライト",
    "パピーズドリーム",
    "健康わんこ食堂",
    "愛犬のごちそう",
    "ナチュラルテイル",
]

# 投稿内容のテンプレート
post_templates = [
    {
        "title": "うちの子のお気に入り！{brand}のプレミアムフード",
        "content": "最近{brand}のプレミアムフードに変えてから、毛並みがツヤツヤになりました！食いつきも抜群で、お皿がピカピカになるまで食べてくれます。特に{flavor}味がお気に入りみたいです。",
        "flavors": ["チキン＆野菜", "サーモン＆ポテト", "ラム＆ライス", "ビーフ＆かぼちゃ"]
    },
    {
        "title": "{brand}に変えてから体調が良くなりました",
        "content": "獣医さんに勧められて{brand}を試してみたら、{dog_name}の体調がすごく良くなりました。{benefit}が改善されて、散歩も元気いっぱいです！小粒で食べやすいのも良いですね。",
        "dog_names": ["ポチ", "コロ", "モモ", "チョコ", "マロン", "レオ", "ソラ"],
        "benefits": ["お腹の調子", "関節の動き", "皮膚のかゆみ", "体重管理"]
    },
    {
        "title": "{brand}のグレインフリーフードを試してみました",
        "content": "アレルギー体質の{dog_name}のために{brand}のグレインフリーを購入。穀物不使用で{protein}がメインなので安心です。価格は少し高めですが、健康を考えれば納得の品質です。",
        "dog_names": ["ハナ", "リン", "ムギ", "ココ", "ナナ", "ルル"],
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
        "months": [3, 4, 5, 6, 8],
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
        "title": "コスパ最高！{brand}のお徳用パック",
        "content": "多頭飼いなので{brand}の{size}kgパックを購入。品質も良くて、{dogs_count}匹みんな喜んで食べています。定期購入で{discount}%OFFになるのもありがたい！",
        "sizes": [5, 10, 15, 20],
        "dogs_count": [2, 3, 4],
        "discounts": [10, 15, 20]
    },
    {
        "title": "{brand}の低アレルゲンフードで安心",
        "content": "食物アレルギーがある{dog_name}でも{brand}の低アレルゲンフードなら大丈夫でした。{ingredient}不使用で、代わりに{alternative}を使っているので消化も良好です。",
        "dog_names": ["アズキ", "キナコ", "ダイズ", "ゴマ"],
        "ingredients": ["小麦", "トウモロコシ", "大豆", "乳製品"],
        "alternatives": ["タピオカ", "さつまいも", "えんどう豆", "ひよこ豆"]
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

def register_user(email, password, name):
    """ユーザーを登録"""
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": email,
            "password": password,
            "name": name,
            "phone_number": "090-1234-5678"
        }
    )
    if response.status_code != 200:
        print(f"  登録エラー: {response.text}")
    return response.status_code == 200

def login_user(email, password):
    """ユーザーログインしてトークンを取得"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"  ログインエラー: {response.text}")
    return None

def create_post(token, title, content):
    """投稿を作成"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/api/posts/",
        headers=headers,
        json={
            "title": title,
            "content": content,
            "post_type": "general"
        }
    )
    return response.json() if response.status_code == 200 else None

def create_comment(token, post_id, content):
    """コメントを作成"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/api/posts/{post_id}/comments",
        headers=headers,
        json={"content": content}
    )
    return response.status_code == 200

def main():
    print("🐕 架空のドッグフードブランドに関する投稿を作成します...")
    
    # ユーザー名リスト
    user_names = ["田中太郎", "佐藤花子", "鈴木一郎", "山田美咲", "高橋健太"]
    
    # テストユーザーの作成/ログイン
    tokens = []
    for i, user in enumerate(test_users[:len(user_names)]):
        # 登録を試みる（既に存在する場合は失敗するが問題ない）
        register_user(user["email"], user["password"], user_names[i])
        
        # ログイン
        token = login_user(user["email"], user["password"])
        if token:
            tokens.append(token)
            print(f"✅ ユーザー {user_names[i]} でログイン成功")
        else:
            print(f"❌ ユーザー {user_names[i]} のログインに失敗")
    
    if not tokens:
        print("❌ ログインできるユーザーがいません。")
        return
    
    # 投稿の作成
    created_posts = []
    post_count = 0
    
    for template in post_templates:
        for brand in FICTIONAL_BRANDS:
            # ランダムにユーザーを選択
            token = random.choice(tokens)
            
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
            elif "sizes" in template:
                content = content.format(
                    brand=brand,
                    size=random.choice(template["sizes"]),
                    dogs_count=random.choice(template["dogs_count"]),
                    discount=random.choice(template["discounts"])
                )
            elif "ingredients" in template:
                content = content.format(
                    brand=brand,
                    dog_name=random.choice(template["dog_names"]),
                    ingredient=random.choice(template["ingredients"]),
                    alternative=random.choice(template["alternatives"])
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
            post = create_post(token, title, content)
            if post:
                created_posts.append(post)
                post_count += 1
                print(f"📝 投稿 {post_count}: 「{title}」を作成しました")
                
                # 50%の確率でコメントも追加
                if random.random() > 0.5 and len(tokens) > 1:
                    # 別のユーザーからコメント
                    comment_token = random.choice([t for t in tokens if t != token])
                    comments = [
                        f"うちも{brand}使ってます！本当に良いフードですよね。",
                        f"{brand}気になってました！参考になります。",
                        "良さそうですね！今度試してみます。",
                        f"うちの子も{brand}大好きです！",
                        "詳しい情報ありがとうございます！",
                        f"{brand}のサンプルもらって試したことあります。確かに食いつき良かったです！",
                        "毛並みが良くなるの魅力的ですね✨"
                    ]
                    if create_comment(comment_token, post["id"], random.choice(comments)):
                        print(f"  💬 コメントを追加しました")
    
    print(f"\n✨ 完了！合計 {post_count} 件の投稿を作成しました。")
    print("ブラウザで http://localhost:3000 を開いて投稿を確認してください。")

if __name__ == "__main__":
    main()