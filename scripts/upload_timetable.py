import os
import csv
import psycopg2

# Connect to the database
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    sslmode="require"
)

# Open a cursor to perform database operations
cur = conn.cursor()

# Delete all rows in the table
cur.execute('DELETE FROM classes')
print("All rows deleted successfully")

# Insert rows from CSV file
with open('public/classes.csv', 'r') as f:
    reader = csv.reader(f) # Create a CSV reader object
    next(reader)  # Skip header
    i = 0 # Counter for number of rows inserted
    for row in reader: # Iterate over each row
        print(row) # Print the row
        cur.execute('INSERT INTO classes ("SubCode", "Class", "Day", "StartTime", "EndTime", "Room", "Teacher") VALUES (%s, %s, %s, %s, %s, %s, %s)',row) # Insert the row into the table
        i += 1
        print(f"Row {i} inserted successfully")

conn.commit() # Commit the transaction
cur.close() # Close the cursor
conn.close() # Close the connection
