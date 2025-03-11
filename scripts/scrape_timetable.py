import argparse
import csv
import json
import random
import re
import sys
import time
from datetime import datetime

import cloudscraper
from bs4 import BeautifulSoup

ROOMS = {
    "0.17":"0.17-Lecture Theatre",
    "0.201":"0.201-Concrete / Geo Tech Lab",
    "1.38":"1.38-Circuits Lab",
    "1.48":"1.48-Thermal Lab",
    "1.49":"1.49-Manufacturing & Workshop Lab",
    "1.52":"1.52-Computer Lab Single",
    "1.53":"1.53-Chemistry & Materials Science Lab",
    "2.50":"2.50-Computer Lab Single",
    "2.51":"2.51-Project Lab",
    "3.42":"3.42-Classroom B",
    "3.44":"3.44-Classroom B",
    "3.45":"3.45-Classroom B",
    "3.46":"3.46-Classroom A",
    "3.47":"3.47-Game Dev Lab Dual Screens",
    "3.48":"3.48-Classroom B",
    "3.52":"3.52-Computer Lab (Network)",
    "3.53":"3.53-Physics/Robotics Lab",
    "4.42":"4.42-Computer Lab (Single Screen)",
    "4.44":"4.44-Classroom B",
    "4.45":"4.45-Classroom B",
    "4.467":"4.467-Classroom A 4.46 & 4.47",
    "4.48":"4.48-Classroom B",
    "4.50":"4.50-Classroom B",
    "4.51":"4.51-Tutorial Room",
    "4.52":"4.52-Classroom A",
    "4.53":"4.53-Seminar/Tutorial",
    "5.08":"5.08-Seminar / Tutorial",
    "5.10":"5.10-Classroom B",
    "5.11":"5.11-Classroom B",
    "5.12":"5.12-Informal Classroom",
    "5.134":"5.134-Classroom A 5.13 & 5.14",
    "5.15":"5.15-MAC Lab",
    "5.17":"5.17-Classroom VC",
    "5.18":"5.18-Classroom A",
    "5.19":"5.19-Classroom A",
    "6.28":"6.28-Seminar/Tutorial",
    "6.29":"6.29-Multipurpose - Teaching & Research",
    "6.30":"6.30-Multipurpose - Teaching & Research",
    "6.32":"6.32-Classroom B",
    "6.33":"6.33-Classroom B",
    "6.345":"6.345-Classroom A 6.34 & 6.35",
    "6.36":"6.36-Computer Lab (Single Screen)",
    "6.38":"6.38-Classroom B",
    "6.39":"6.39-Classroom A",
    "6.40":"6.40-Computer Lab Single",
    "Consultation":"Consultation",
    "Online":"Online"
}

class TimetableScraper:
    """ UOW Dubai timetable scraper """

    def __init__(self):
        """ Initialize scraper with cloudscraper instance """
        self.scraper = self.create_scraper()
        self.semester_cache = {}
        self.headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://my.uowdubai.ac.ae/',
            'DNT': '1',
        }

    def create_scraper(self):
        """ Create a new cloudscraper instance with random user agent """
        return cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True,
                'mobile': False
            },
            delay=random.uniform(5, 10)
        )

    def get_current_semester_text(self):
        """ Return the current semester text """
        today = datetime.now()
        year = today.year
        return {
            1 <= today.month <= 4: f"Winter {year}",
            5 <= today.month <= 6: f"Spring {year}",
            7 <= today.month <= 8: f"Summer {year}",
        }.get(True, f"Autumn {year}")

    def fetch_page(self, url, max_retries=5):
        """ Fetch a page with retries and random user agent """
        for attempt in range(max_retries):
            try:
                response = self.scraper.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()

                # Randomize request timing
                time.sleep(random.uniform(1, 3))

                return response
            except Exception as e:
                print(f"Attempt {attempt+1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise

                # Rotate headers and recreate scraper
                self.headers['User-Agent'] = self.random_user_agent()
                self.scraper = self.create_scraper()
                time.sleep(random.uniform(5, 15))

    def random_user_agent(self):
        """ Return a random user agent string """
        return random.choice([
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15...",
        ])

    def extract_semester_ids(self, html):
        """ Extract semester IDs from the base page """
        soup = BeautifulSoup(html, 'html.parser')
        semesters = {}

        for div in soup.select('div.custom-control.custom-radio.custom-control-inline'):
            radio = div.find('input', {'name': 'semester'})
            label = div.find('label').get_text(strip=True)
            if radio and label:
                semesters[label] = radio['value']

        return semesters

    def get_target_semester_id(self, html):
        """ Find the semester ID that matches the current semester """
        current_semester = self.get_current_semester_text()
        semesters = self.extract_semester_ids(html)

        # Find best match that contains current semester text
        for label, sid in semesters.items():
            if current_semester.lower() in label.lower():
                return sid

        # Fallback to first available if no match
        return next(iter(semesters.values()), None)

    def extract_timetable_data(self, html):
        """ Extract timetable data from the final page """
        soup = BeautifulSoup(html, 'html.parser')
        scripts = soup.find_all('script')

        for script in scripts:
            if script.string and 'timetableData' in script.string:
                match = re.search(r'timetableData\s*=\s*(\[.*?\]);', script.string, re.DOTALL)
                if match:
                    return json.loads(match.group(1))
        return None

    def process_data(self, raw_data, output_path):
        """ Process raw timetable data and write to CSV """
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=[
                "SubCode", "Class", "Day", "StartTime",
                "EndTime", "Room", "Teacher"
            ])
            writer.writeheader()

            for entry in raw_data:
                if not entry.get('subject_code'):
                    continue

                rooms = entry['location'].split(';') if ';' in entry['location'] else [entry['location']]
                teachers = entry['lecturer'].split(';') if ';' in entry['lecturer'] else [entry['lecturer']]

                for room in rooms:
                    room = room.strip()
                    room_code = room.split('-')[0].strip()
                    room_name = ROOMS.get(room_code, room)

                    for teacher in teachers:
                        writer.writerow({
                            'SubCode': entry['subject_code'].replace(' ', ''),
                            'Class': entry['type_with_section'].strip(),
                            'Day': entry['week_day'],
                            'StartTime': entry['start_time'],
                            'EndTime': entry['end_time'],
                            'Room': room_name,
                            'Teacher': teacher.strip()
                        })

    def scrape(self, output_path):
        """ Scrape timetable data and write to CSV """
        try:
            # Step 1: Get base page to find semester IDs
            base_response = self.fetch_page('https://my.uowdubai.ac.ae/timetable/viewer')
            semester_id = self.get_target_semester_id(base_response.text)

            if not semester_id:
                raise ValueError("Could not determine semester ID")

            # Step 2: Get timetable data with semester parameter
            target_url = f'https://my.uowdubai.ac.ae/timetable/viewer?semester={semester_id}'
            final_response = self.fetch_page(target_url)

            # Step 3: Extract and process data
            timetable_data = self.extract_timetable_data(final_response.text)
            if not timetable_data:
                raise ValueError("No timetable data found in page")

            self.process_data(timetable_data, output_path)
            return True

        except Exception as e:
            print(f"Scraping failed: {str(e)}")
            return False

def main():
    """ Main entry point """
    parser = argparse.ArgumentParser(description='Scrape UOW Dubai timetable data')
    parser.add_argument('--output', required=True, help='Output CSV file path')
    args = parser.parse_args()

    scraper = TimetableScraper()
    success = scraper.scrape(args.output)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
