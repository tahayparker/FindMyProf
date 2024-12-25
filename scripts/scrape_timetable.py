import argparse
import json
import cloudscraper
from bs4 import BeautifulSoup
import re
import sys
import csv
import time
import random

# Convert rooms list to a more usable dictionary format
ROOMS = {}
for room_dict in [{"0.17":"0.17-Lecture Theatre"}, {"0.201":"0.201-Concrete / Geo Tech Lab"}, {"1.38":"1.38-Circuits Lab"}, {"1.48":"1.48-Thermal Lab"}, {"1.49":"1.49-Manufacturing & Workshop Lab"}, {"1.52":"1.52-Computer Lab Single"}, {"1.53":"1.53-Chemistry & Materials Science Lab"}, {"2.50":"2.50-Computer Lab Single"}, {"2.51":"2.51-Project Lab"}, {"3.42":"3.42-Classroom B"}, {"3.44":"3.44-Classroom B"}, {"3.45":"3.45-Classroom B"}, {"3.46":"3.46-Classroom A"}, {"3.47":"3.47-Game Dev Lab Dual Screens"}, {"3.48":"3.48-Classroom B"}, {"3.52":"3.52-Computer Lab (Network)"}, {"3.53":"3.53-Physics/Robotics Lab"}, {"4.42":"4.42-Computer Lab (Single Screen)"}, {"4.44":"4.44-Classroom B"}, {"4.45":"4.45-Classroom B"}, {"4.467":"4.467-Classroom A 4.46 & 4.47"}, {"4.48":"4.48-Classroom B"}, {"4.50":"4.50-Classroom B"}, {"4.51":"4.51-Tutorial Room"}, {"4.52":"4.52-Classroom A"}, {"4.53":"4.53-Seminar/Tutorial"}, {"5.08":"5.08-Seminar / Tutorial"}, {"5.10":"5.10-Classroom B"}, {"5.11":"5.11-Classroom B"}, {"5.12":"5.12-Informal Classroom"}, {"5.134":"5.134-Classroom A 5.13 & 5.14"}, {"5.15":"5.15-MAC Lab"}, {"5.17":"5.17-Classroom VC"}, {"5.18":"5.18-Classroom A"}, {"5.19":"5.19-Classroom A"}, {"6.28":"6.28-Seminar/Tutorial"}, {"6.29":"6.29-Multipurpose - Teaching & Research"}, {"6.30":"6.30-Multipurpose - Teaching & Research"}, {"6.32":"6.32-Classroom B"}, {"6.33":"6.33-Classroom B"}, {"6.345":"6.345-Classroom A 6.34 & 6.35"}, {"6.36":"6.36-Computer Lab (Single Screen)"}, {"6.38":"6.38-Classroom B"}, {"6.39":"6.39-Classroom A"}, {"6.40":"6.40-Computer Lab Single"}, {"Consultation":"Consultation"}, {"Online":"Online"}]:
    for key, value in room_dict.items():
        ROOMS[key] = value

def fetch_with_retry(url, max_retries=5):
    # Create a cloudscraper session
    scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False
        },
        delay=10
    )
    
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                time.sleep(random.uniform(3, 7))
            
            print(f"Attempt {attempt + 1} of {max_retries}...")
            
            response = scraper.get(url, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            response.raise_for_status()
            return response
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise
            
            scraper = cloudscraper.create_scraper(
                browser={
                    'browser': 'chrome',
                    'platform': 'windows',
                    'mobile': False
                }
            )
            time.sleep(random.uniform(5, 10))

def handle_splits(row):
    result_rows = []
    
    # Split rooms if semicolon exists
    rooms = [room.strip() for room in row['Room'].split(';')] if ';' in row['Room'] else [row['Room']]
    
    # Split professors if semicolon exists
    professors = [prof.strip() for prof in row['Teacher'].split(';')] if ';' in row['Teacher'] else [row['Teacher']]
    
    # Create cartesian product of rooms and professors
    for room in rooms:
        for professor in professors:
            new_row = row.copy()
            new_row['Room'] = room
            new_row['Teacher'] = professor
            result_rows.append(new_row)
            
    return result_rows

def scrape_timetable(output_path):
    try:
        print("Fetching timetable data...")
        response = fetch_with_retry('https://my.uowdubai.ac.ae/timetable/viewer')
        
        print("Parsing page content...")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Save the HTML for debugging
        with open('debug_page.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        scripts = soup.find_all('script')
        
        timetable_data = None
        for script in scripts:
            if script.string and 'timetableData' in script.string:
                match = re.search(r'timetableData\s*=\s*(\[.*?\]);', script.string, re.DOTALL)
                if match:
                    timetable_data = json.loads(match.group(1))
                    break
        
        if not timetable_data:
            print("No timetable data found in the page")
            print("Page content snippet:")
            print(response.text[:500])
            return False
        
        print(f"Found {len(timetable_data)} raw entries")
        
        # CSV Headers
        headers = ["SubCode", "Class", "Day", "StartTime", "EndTime", "Room", "Teacher"]
        
        # Transform and write the data
        valid_entries = 0
        with open(output_path, mode='w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            
            for entry in timetable_data:
                if not entry.get('subject_code'):
                    continue
                    
                row = {
                    'SubCode': entry['subject_code'].replace(' ', ''),
                    'Class': entry['type_with_section'].strip(),
                    'Day': entry['week_day'],
                    'StartTime': entry['start_time'],
                    'EndTime': entry['end_time'],
                    'Room': entry['location'],
                    'Teacher': entry['lecturer']
                }
                rows = handle_splits(row)
                for split_row in rows:
                    room_code = split_row['Room'].split('-')[0].strip()
                    split_row['Room'] = ROOMS.get(room_code, split_row['Room'])
                    writer.writerow(split_row)
                valid_entries += 1
        
        print(f"Processed {valid_entries} valid entries")
        print(f"Successfully saved data to {output_path}")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("Full error details:", file=sys.stderr)
        import traceback
        print(traceback.format_exc(), file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='Scrape UOW Dubai timetable data')
    parser.add_argument('--output', required=True, help='Output CSV file path')
    
    args = parser.parse_args()
    
    success = scrape_timetable(args.output)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
