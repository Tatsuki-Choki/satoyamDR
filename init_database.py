import sys
sys.path.append('satoyama_dogrun_backend-main')

from database import engine
from db_control.models import Base

def init_db():
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    print("✅ データベースのテーブルを作成しました。")

if __name__ == "__main__":
    init_db()