import json
import os
import logging
import psycopg2
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Define constants
DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
TIME_SLOTS = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
    '20:30', '21:00', '21:30', '22:00', '22:30'
]

# Database connection
try:
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        sslmode="require"
    )
    cur = conn.cursor()
    logging.info("Database connection established successfully")
except Exception as e:
    logging.error(f"Database connection failed: {str(e)}")
    raise

def fetch_professors():
    logging.info("Fetching unique professor names from database...")
    try:
        query = """
            SELECT DISTINCT "Teacher"
            FROM "classes"
            WHERE "Teacher" IS NOT NULL
            ORDER BY "Teacher" ASC;
        """
        cur.execute(query)
        rows = cur.fetchall()
        professor_names = [row[0] for row in rows]
        logging.info(f"Successfully fetched {len(professor_names)} professors")
        return professor_names
    except Exception as e:
        logging.error(f"Error fetching professors: {str(e)}")
        raise

def check_professor_availability(professor, day, start_time, end_time):
    logging.debug(f"Checking availability for professor {professor} on {day} from {start_time} to {end_time}")
    try:
        query = """
            SELECT 1
            FROM "classes"
            WHERE "Teacher" = %s
              AND "Day" = %s
              AND NOT ("EndTime" <= %s OR "StartTime" >= %s)
            LIMIT 1;
        """
        cur.execute(query, (professor, day, start_time, end_time))
        result = cur.fetchone()
        available = result is None
        logging.debug(f"Professor {professor} is {'available' if available else 'not available'} on {day} from {start_time} to {end_time}")
        return available
    except Exception as e:
        logging.error(f"Error checking availability for professor {professor}: {str(e)}")
        raise

def generate_schedule_data():
    logging.info("Starting schedule data generation process...")
    try:
        professors = fetch_professors()
        schedule = []
        total_professors = len(professors)

        for day_index, day in enumerate(DAYS_OF_WEEK, 1):
            logging.info(f"Processing day {day_index}/7: {day}")
            day_data = {"day": day, "professors": []}

            for prof_index, professor in enumerate(professors, 1):
                logging.info(f"Processing professor {prof_index}/{total_professors}: {professor} for {day}")
                professor_data = {"professor": professor, "availability": []}

                for i in range(len(TIME_SLOTS) - 1):
                    start_time = TIME_SLOTS[i]
                    end_time = TIME_SLOTS[i + 1]
                    available = check_professor_availability(professor, day, start_time, end_time)
                    professor_data["availability"].append(1 if available else 0)

                day_data["professors"].append(professor_data)
                logging.debug(f"Completed availability check for {professor} on {day}")

            schedule.append(day_data)
            logging.info(f"Completed processing for {day}")

        logging.info("Schedule data generation completed successfully")
        return schedule
    except Exception as e:
        logging.error(f"Error generating schedule data: {str(e)}")
        raise

def save_schedule_data():
    logging.info("Starting to save schedule data...")
    try:
        schedule_data = generate_schedule_data()
        output_path = Path("./public/professorSchedule.json")
        
        logging.info(f"Writing data to {output_path.resolve()}")
        with output_path.open("w") as file:
            json.dump(schedule_data, file, indent=2)
        
        logging.info("Schedule data saved successfully")
        file_size = output_path.stat().st_size / 1024  # Size in KB
        logging.info(f"Output file size: {file_size:.2f} KB")
        
    except Exception as e:
        logging.error(f"Error saving schedule data: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        logging.info("Starting schedule generation script")
        save_schedule_data()
        logging.info("Script completed successfully")
    except Exception as e:
        logging.error(f"Script failed: {str(e)}")
        raise
    finally:
        logging.info("Closing database connection...")
        cur.close()
        conn.close()
        logging.info("Database connection closed")
