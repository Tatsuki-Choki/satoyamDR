import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """アプリケーション設定"""
    
    # 基本設定
    app_name: str = "里山ドッグラン API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # サーバー設定
    host: str = "0.0.0.0"
    port: int = 8000
    
    # データベース設定
    database_url: str = "sqlite:///./satoyama_dogrun.db"
    
    # JWT設定
    secret_key: str = ""  # 環境変数から必須で読み込む
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # SECRET_KEYの検証
        if not self.secret_key or self.secret_key == "your-secret-key-here-change-this-in-production":
            import os
            env_secret = os.getenv("SECRET_KEY")
            if not env_secret or env_secret == "your-secret-key-here-change-this-in-production":
                raise ValueError(
                    "SECRET_KEYが設定されていません。環境変数SECRET_KEYを設定してください。"
                    "本番環境では強力なランダムな文字列を使用してください。"
                )
            self.secret_key = env_secret
    
    # CORS設定
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # ファイルアップロード設定
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: List[str] = ["image/jpeg", "image/png", "image/gif"]
    
    # パスワード設定
    min_password_length: int = 8
    
    # ログ設定
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 設定インスタンス
settings = Settings()

# 環境変数から読み込み
def get_settings() -> Settings:
    """設定を取得"""
    return settings 