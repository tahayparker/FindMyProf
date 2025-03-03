import json
import os
import psycopg2
from pathlib import Path

# Define constants
DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
TIME_SLOTS = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
    '20:30', '21:00', '21:30', '22:00', '22:30'
]

# Database connection
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    sslmode="require"
)
cur = conn.cursor()

def fetch_rooms():
    print("Fetching unique room names from database...")
    query = """
        SELECT DISTINCT "Room"
        FROM classes
        WHERE "Room" NOT LIKE '%Consultation%'
        AND "Room" NOT LIKE '%Online%'
        ORDER BY "Room" ASC;
    """
    cur.execute(query)
    rows = cur.fetchall()
    rooms = [row[0].split('-')[0] for row in rows]
    print(f"Rooms fetched: {rooms}")
    return rooms

def check_room_availability(room, day, start_time, end_time):
    print(f"Checking availability for room {room} on {day} from {start_time} to {end_time}...")
    query = """
        SELECT 1
        FROM classes
        WHERE "Room" LIKE %s
          AND "Day" = %s
          AND NOT ("EndTime" <= %s OR "StartTime" >= %s)
        LIMIT 1;
    """
    cur.execute(query, (f"{room}%", day, start_time, end_time))
    result = cur.fetchone()
    available = result is None
    print(f"Room {room} availability: {'Available' if available else 'Not Available'}")
    return available

def generate_schedule_data():
    print("Starting schedule data generation...")
    room_names = fetch_rooms()
    schedule = []

    for day in DAYS_OF_WEEK:
        print(f"Processing day: {day}")
        day_data = {"day": day, "rooms": []}

        for room in room_names:
            room_data = {"room": room, "availability": []}

            for i in range(len(TIME_SLOTS) - 1):
                start_time = TIME_SLOTS[i]
                end_time = TIME_SLOTS[i + 1]
                available = check_room_availability(room, day, start_time, end_time)
                room_data["availability"].append(1 if available else 0)

            day_data["rooms"].append(room_data)

        schedule.append(day_data)

    return schedule

def save_schedule_data():
    print("Saving schedule data to JSON file...")
    schedule_data = generate_schedule_data()
    output_path = Path("./public/scheduleData.json")
    with output_path.open("w") as file:
        json.dump(schedule_data, file, indent=2)
    print(f"Schedule data saved to {output_path.resolve()}")

if __name__ == "__main__":
    save_schedule_data()
    cur.close()
    conn.close()
