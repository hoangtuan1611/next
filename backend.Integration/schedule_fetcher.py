import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Teacher, Schedule

# Base URL for the teacher schedule API
BASE_URL = "https://qlgd.dlu.edu.vn/public/DrawingProfessorSchedule"

# List of teachers with their IDs and names
TEACHERS = [
    {"id": "011.031.00125", "name": "La Quốc Thắng"},
    {"id": "011.031.00140", "name": "Lê Thiên Anh"},
    {"id": "011.034.00010", "name": "Nguyễn Thị Lương"},
    {"id": "011.034.00017", "name": "Tạ Hoàng Thắng"},
    {"id": "011.034.00018", "name": "Thái Duy Quý"},
    {"id": "011.034.00020", "name": "Phan Thị Thanh Nga"},
    {"id": "011.034.00027", "name": "Đoàn Minh Khuê"},
    {"id": "011.034.00028", "name": "Trần Thị Phương Linh"}
]

# Default parameters for the schedule request
DEFAULT_YEAR_STUDY = "2024-2025"
DEFAULT_TERM_ID = "HK02"
DEFAULT_WEEK = 1  # Default to week 1, can be updated as needed

# SQLite database setup
DATABASE_URL = "sqlite:///schedules.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def build_url(professor_id, week):
    timestamp = datetime.now().timestamp()
    return f"{BASE_URL}?YearStudy={DEFAULT_YEAR_STUDY}&TermID={DEFAULT_TERM_ID}&Week={week}&ProfessorID={professor_id}&t={timestamp}"

def fetch_schedule(professor_id, week):
    url = build_url(professor_id, week)
    response = requests.get(url, verify=False)
    requests.packages.urllib3.disable_warnings()
    if response.status_code != 200:
        raise Exception(f"Failed to fetch schedule for professor {professor_id}: {response.status_code}")
    return response.text

def parse_schedule(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    schedule = {}
    rows = soup.find('table').find_all('tr')[1:]  # Skip header row
    days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    for row, day in zip(rows, days):
        cells = row.find_all('td')
        schedule[day] = {
            'morning': _parse_class_cell(cells[0]),
            'afternoon': _parse_class_cell(cells[1]),
            'evening': _parse_class_cell(cells[2])
        }
    return schedule

def _parse_class_cell(cell):
    if not cell.find('span'):
        return []
    spans = cell.find_all('span')
    if len(spans) < 7:
        return []
    try:
        return [{
            'subject': spans[0].text.strip(),
            'class_code': spans[1].text.replace('-Mã LHP:', '').strip(),
            'class_name': spans[2].text.replace('-Lớp:', '').strip(),
            'period': spans[3].text.replace('-Tiết:', '').strip(),
            'taught_lessons': spans[4].text.replace('-Đã dạy:', '').strip(),
            'room': spans[5].text.replace('-Phòng :', '').strip(),
            'content': spans[6].text.replace('-Nội dung :', '').strip()
        }]
    except Exception as e:
        print(f"Error parsing cell: {e}")
        return []

def save_schedule_to_db(schedule_data, teacher_id, teacher_name, week, db_session):
    # First, ensure teacher exists
    teacher = db_session.query(Teacher).filter_by(id=teacher_id).first()
    if not teacher:
        teacher = Teacher(id=teacher_id, name=teacher_name)
        db_session.add(teacher)
        db_session.commit()

    # Delete existing schedules for this teacher and week
    db_session.query(Schedule).filter_by(teacher_id=teacher_id, week=week).delete()

    # Save new schedules
    for day, periods in schedule_data.items():
        for period_name, classes in periods.items():
            for class_info in classes:
                schedule = Schedule(
                    teacher_id=teacher_id,
                    week=week,
                    day=day,
                    period=period_name,
                    subject=class_info.get('subject'),
                    class_code=class_info.get('class_code'),
                    class_name=class_info.get('class_name'),
                    taught_lessons=class_info.get('taught_lessons'),
                    room=class_info.get('room'),
                    content=class_info.get('content')
                )
                db_session.add(schedule)
    
    db_session.commit()
    print(f"Schedule for {teacher_name} (Week {week}) saved to database")

def main():
    init_db()
    db_session = SessionLocal()
    
    try:
        current_week = DEFAULT_WEEK
        for teacher in TEACHERS:
            try:
                html_content = fetch_schedule(teacher['id'], current_week)
                schedule = parse_schedule(html_content)
                save_schedule_to_db(schedule, teacher['id'], teacher['name'], current_week, db_session)
                time.sleep(1)  # Add delay to avoid overwhelming the server
            except Exception as e:
                print(f"Error processing schedule for {teacher['name']}: {e}")
    finally:
        db_session.close()

if __name__ == "__main__":
    main() 