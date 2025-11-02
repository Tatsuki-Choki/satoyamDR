"""
設定管理関連のルーター（営業時間、特別休業日、システム設定）
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from datetime import datetime, date, time
from uuid import uuid4
import json

from routers.shared import get_db, get_current_admin_user
from auth import log_admin_action
from db_control.models import (
    BusinessHour, SpecialHoliday, SystemSetting
)
from schemas import (
    BusinessHourResponse, BusinessHourUpdateRequest,
    SpecialHolidayResponse, SpecialHolidayCreateRequest, SpecialHolidayUpdateRequest,
    TodayBusinessHoursResponse,
    SystemSettingResponse, SystemSettingUpdateRequest,
    SystemSettingsCategoryResponse, SystemSettingsBackupResponse, SystemSettingsImportRequest
)

router = APIRouter(prefix="/admin", tags=["設定管理"])


# 営業時間管理
@router.get("/business-hours", response_model=List[BusinessHourResponse])
async def get_business_hours(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """営業時間一覧取得"""
    business_hours = db.query(BusinessHour).order_by(BusinessHour.day_of_week).all()
    return [BusinessHourResponse(
        id=bh.id,
        day_of_week=bh.day_of_week,
        is_open=bh.is_open,
        open_time=str(bh.open_time) if bh.open_time else None,
        close_time=str(bh.close_time) if bh.close_time else None,
        special_note=bh.special_note,
        created_at=bh.created_at,
        updated_at=bh.updated_at
    ) for bh in business_hours]


@router.put("/business-hours")
async def update_business_hours(
    updates: List[dict] = Body(...),
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """営業時間一括更新"""
    for update in updates:
        day_of_week = update.get("day_of_week")
        if day_of_week is not None:
            bh = db.query(BusinessHour).filter(BusinessHour.day_of_week == day_of_week).first()
            if bh:
                bh.is_open = update.get("is_open", bh.is_open)
                if update.get("open_time"):
                    hour, minute = map(int, update["open_time"].split(":"))
                    bh.open_time = time(hour, minute)
                if update.get("close_time"):
                    hour, minute = map(int, update["close_time"].split(":"))
                    bh.close_time = time(hour, minute)
                bh.special_note = update.get("special_note", bh.special_note)
                bh.updated_at = datetime.utcnow()
    
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="business_hours_updated",
        target_type="business_hours",
        target_id=None,
        details="営業時間を更新しました",
        db=db
    )
    
    return {"message": "営業時間を更新しました"}


@router.get("/business-hours/today", response_model=TodayBusinessHoursResponse)
async def get_today_business_hours(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """本日の営業時間取得"""
    today = date.today()
    day_of_week = today.weekday()  # 月曜=0, 日曜=6
    # SQLの曜日形式に変換（日曜=0, 月曜=1）
    sql_day_of_week = (day_of_week + 1) % 7
    
    # 通常の営業時間を取得
    business_hour = db.query(BusinessHour).filter(
        BusinessHour.day_of_week == sql_day_of_week
    ).first()
    
    # 特別休業日チェック
    special_holiday = db.query(SpecialHoliday).filter(
        SpecialHoliday.holiday_date == today
    ).first()
    
    day_names = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    
    if special_holiday:
        return TodayBusinessHoursResponse(
            date=today,
            day_of_week=sql_day_of_week,
            day_name=day_names[sql_day_of_week],
            is_open=special_holiday.is_open,
            open_time=str(special_holiday.open_time) if special_holiday.open_time else None,
            close_time=str(special_holiday.close_time) if special_holiday.close_time else None,
            special_note=special_holiday.note,
            is_holiday=True,
            holiday_name=special_holiday.holiday_name
        )
    elif business_hour:
        return TodayBusinessHoursResponse(
            date=today,
            day_of_week=sql_day_of_week,
            day_name=day_names[sql_day_of_week],
            is_open=business_hour.is_open,
            open_time=str(business_hour.open_time) if business_hour.open_time else None,
            close_time=str(business_hour.close_time) if business_hour.close_time else None,
            special_note=business_hour.special_note,
            is_holiday=False,
            holiday_name=None
        )
    else:
        return TodayBusinessHoursResponse(
            date=today,
            day_of_week=sql_day_of_week,
            day_name=day_names[sql_day_of_week],
            is_open=False,
            open_time=None,
            close_time=None,
            special_note="営業時間が設定されていません",
            is_holiday=False,
            holiday_name=None
        )


# 特別休業日管理
@router.get("/special-holidays", response_model=List[SpecialHolidayResponse])
async def get_special_holidays(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """特別休業日一覧取得"""
    holidays = db.query(SpecialHoliday).order_by(SpecialHoliday.holiday_date).all()
    return [SpecialHolidayResponse(
        id=h.id,
        holiday_date=h.holiday_date,
        holiday_name=h.holiday_name,
        is_open=h.is_open,
        open_time=str(h.open_time) if h.open_time else None,
        close_time=str(h.close_time) if h.close_time else None,
        note=h.note,
        created_at=h.created_at,
        updated_at=h.updated_at
    ) for h in holidays]


@router.post("/special-holidays", response_model=SpecialHolidayResponse)
async def create_special_holiday(
    request: SpecialHolidayCreateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """特別休業日追加"""
    # 既存の同じ日付のチェック
    existing = db.query(SpecialHoliday).filter(
        SpecialHoliday.holiday_date == request.holiday_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="この日付は既に登録されています")
    
    open_time_obj = None
    close_time_obj = None
    if request.open_time:
        hour, minute = map(int, request.open_time.split(":"))
        open_time_obj = time(hour, minute)
    if request.close_time:
        hour, minute = map(int, request.close_time.split(":"))
        close_time_obj = time(hour, minute)
    
    holiday = SpecialHoliday(
        id=str(uuid4()),
        holiday_date=request.holiday_date,
        holiday_name=request.holiday_name,
        is_open=request.is_open,
        open_time=open_time_obj,
        close_time=close_time_obj,
        note=request.note,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="special_holiday_created",
        target_type="special_holiday",
        target_id=holiday.id,
        details=f"特別休業日を追加: {request.holiday_date}",
        db=db
    )
    
    return SpecialHolidayResponse(
        id=holiday.id,
        holiday_date=holiday.holiday_date,
        holiday_name=holiday.holiday_name,
        is_open=holiday.is_open,
        open_time=str(holiday.open_time) if holiday.open_time else None,
        close_time=str(holiday.close_time) if holiday.close_time else None,
        note=holiday.note,
        created_at=holiday.created_at,
        updated_at=holiday.updated_at
    )


@router.put("/special-holidays/{holiday_id}", response_model=SpecialHolidayResponse)
async def update_special_holiday(
    holiday_id: str,
    request: SpecialHolidayUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """特別休業日更新"""
    holiday = db.query(SpecialHoliday).filter(SpecialHoliday.id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="特別休業日が見つかりません")
    
    if request.holiday_name is not None:
        holiday.holiday_name = request.holiday_name
    if request.is_open is not None:
        holiday.is_open = request.is_open
    if request.open_time is not None:
        if request.open_time:
            hour, minute = map(int, request.open_time.split(":"))
            holiday.open_time = time(hour, minute)
        else:
            holiday.open_time = None
    if request.close_time is not None:
        if request.close_time:
            hour, minute = map(int, request.close_time.split(":"))
            holiday.close_time = time(hour, minute)
        else:
            holiday.close_time = None
    if request.note is not None:
        holiday.note = request.note
    
    holiday.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(holiday)
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="special_holiday_updated",
        target_type="special_holiday",
        target_id=holiday_id,
        details=f"特別休業日を更新: {holiday.holiday_date}",
        db=db
    )
    
    return SpecialHolidayResponse(
        id=holiday.id,
        holiday_date=holiday.holiday_date,
        holiday_name=holiday.holiday_name,
        is_open=holiday.is_open,
        open_time=str(holiday.open_time) if holiday.open_time else None,
        close_time=str(holiday.close_time) if holiday.close_time else None,
        note=holiday.note,
        created_at=holiday.created_at,
        updated_at=holiday.updated_at
    )


@router.delete("/special-holidays/{holiday_id}")
async def delete_special_holiday(
    holiday_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """特別休業日削除"""
    holiday = db.query(SpecialHoliday).filter(SpecialHoliday.id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="特別休業日が見つかりません")
    
    holiday_date = holiday.holiday_date
    db.delete(holiday)
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="special_holiday_deleted",
        target_type="special_holiday",
        target_id=holiday_id,
        details=f"特別休業日を削除: {holiday_date}",
        db=db
    )
    
    return {"message": "特別休業日を削除しました"}


# システム設定管理
@router.get("/settings", response_model=List[SystemSettingResponse])
async def get_settings(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """設定一覧取得"""
    settings = db.query(SystemSetting).order_by(SystemSetting.category, SystemSetting.setting_key).all()
    return [SystemSettingResponse(
        id=s.id,
        setting_key=s.setting_key,
        setting_value=s.setting_value,
        setting_type=s.setting_type,
        category=s.category,
        description=s.description,
        is_public=s.is_public,
        created_at=s.created_at,
        updated_at=s.updated_at
    ) for s in settings]


@router.get("/settings/{category}", response_model=SystemSettingsCategoryResponse)
async def get_settings_by_category(
    category: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """カテゴリ別設定取得"""
    settings = db.query(SystemSetting).filter(SystemSetting.category == category).all()
    return SystemSettingsCategoryResponse(
        category=category,
        settings=[SystemSettingResponse(
            id=s.id,
            setting_key=s.setting_key,
            setting_value=s.setting_value,
            setting_type=s.setting_type,
            category=s.category,
            description=s.description,
            is_public=s.is_public,
            created_at=s.created_at,
            updated_at=s.updated_at
        ) for s in settings]
    )


@router.put("/settings/{setting_key}")
async def update_setting(
    setting_key: str,
    request: SystemSettingUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """設定更新"""
    setting = db.query(SystemSetting).filter(SystemSetting.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="設定が見つかりません")
    
    setting.setting_value = request.setting_value
    setting.updated_at = datetime.utcnow()
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="system_setting_updated",
        target_type="system_setting",
        target_id=setting_key,
        details=f"設定を更新: {setting_key} = {request.setting_value}",
        db=db
    )
    
    return {"message": "設定を更新しました"}


@router.post("/settings/backup", response_model=SystemSettingsBackupResponse)
async def backup_settings(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """設定バックアップ"""
    settings = db.query(SystemSetting).all()
    backup_id = str(uuid4())
    
    # バックアップデータを作成
    backup_data = {
        s.setting_key: s.setting_value
        for s in settings
    }
    
    # TODO: 実際のファイルシステムへの保存処理を実装
    # ここでは仮のファイルパスを返す
    file_path = f"backups/settings_{backup_id}.json"
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="settings_backup_created",
        target_type="system_settings",
        target_id=backup_id,
        details=f"設定をバックアップ: {len(settings)}件",
        db=db
    )
    
    return SystemSettingsBackupResponse(
        backup_id=backup_id,
        created_at=datetime.utcnow(),
        settings_count=len(settings),
        file_path=file_path
    )


@router.get("/settings/export")
async def export_settings(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """設定エクスポート"""
    settings = db.query(SystemSetting).all()
    
    export_data = {
        s.setting_key: {
            "value": s.setting_value,
            "type": s.setting_type,
            "category": s.category,
            "description": s.description,
            "is_public": s.is_public
        }
        for s in settings
    }
    
    return export_data


@router.post("/settings/import")
async def import_settings(
    request: SystemSettingsImportRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """設定インポート"""
    updated_count = 0
    
    for setting_key, setting_data in request.settings.items():
        setting = db.query(SystemSetting).filter(SystemSetting.setting_key == setting_key).first()
        if setting:
            setting.setting_value = setting_data.get("value", setting.setting_value)
            setting.updated_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="settings_imported",
        target_type="system_settings",
        target_id=None,
        details=f"設定をインポート: {updated_count}件更新",
        db=db
    )
    
    return {"message": f"{updated_count}件の設定を更新しました"}

