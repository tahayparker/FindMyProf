import asyncio
import json
import os
from pathlib import Path
import logging
import asyncpg

# Configure logging for terminal only
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

# Get database URL from environment
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    logging.error("DATABASE_URL environment variable is not set")
    raise ValueError("DATABASE_URL environment variable is required")

# Convert Prisma postgres URL to standard postgres URL if needed
if DB_URL.startswith('prisma+postgres://'):
    DB_URL = DB_URL.replace('prisma+postgres://', 'postgresql://')
    logging.info("Converted Prisma postgres URL to standard postgres URL")

async def fetch_professors(conn):
    logging.info("Starting to fetch unique professor names from database...")
    try:
        query = """
            SELECT DISTINCT "Teacher"
            FROM "classes"
            WHERE "Teacher" IS NOT NULL
            ORDER BY "Teacher" ASC;
        """
        rows = await conn.fetch(query)
        professor_names = [row['Teacher'] for row in rows]
        logging.info(f"Successfully fetched {len(professor_names)} professors")
        logging.debug(f"Professors fetched: {professor_names}")
        return professor_names
    except Exception as e:
        logging.error(f"Error fetching professors: {str(e)}")
        raise

async def check_professor_availability(conn, professor, day, start_time, end_time):
    logging.debug(f"Checking availability for professor {professor} on {day} from {start_time} to {end_time}")
    try:
        query = """
            SELECT 1
            FROM "classes"
            WHERE "Teacher" = $1
              AND "Day" = $2
              AND NOT ("EndTime" <= $3 OR "StartTime" >= $4)
            LIMIT 1;
        """
        result = await conn.fetchrow(query, professor, day, start_time, end_time)
        available = result is None
        logging.debug(f"Professor {professor} is {'available' if available else 'not available'} on {day} from {start_time} to {end_time}")
        return available
    except Exception as e:
        logging.error(f"Error checking availability for professor {professor}: {str(e)}")
        raise

async def generate_schedule_data():
    logging.info("Starting schedule data generation process...")
    
    try:
        logging.info("Establishing database connection...")
        conn = await asyncpg.connect(DB_URL)
        logging.info("Database connection established successfully")
        
        try:
            professors = await fetch_professors(conn)
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
                        available = await check_professor_availability(conn, professor, day, start_time, end_time)
                        professor_data["availability"].append(1 if available else 0)

                    day_data["professors"].append(professor_data)
                    logging.debug(f"Completed availability check for {professor} on {day}")

                schedule.append(day_data)
                logging.info(f"Completed processing for {day}")

            logging.info("Schedule data generation completed successfully")
            return schedule

        finally:
            logging.info("Closing database connection...")
            await conn.close()
            logging.info("Database connection closed")

    except Exception as e:
        logging.error(f"Error generating schedule data: {str(e)}")
        raise

async def save_schedule_data():
    logging.info("Starting to save schedule data...")
    try:
        schedule_data = await generate_schedule_data()
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
        asyncio.run(save_schedule_data())
        logging.info("Script completed successfully")
    except Exception as e:
        logging.error(f"Script failed: {str(e)}")
        raise
