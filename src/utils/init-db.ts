import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import prisma from '../lib/db';

interface CSVData {
  SubCode: string;
  Class: string;
  Day: string;
  StartTime: string;
  EndTime: string;
  Room: string;
  Teacher: string;
}

const clearTable = async () => {
  try {
    console.log('Attempting to clear classes table...');
    await prisma.class.deleteMany({});
    console.log('Table cleared successfully');
  } catch (error) {
    console.error('Error clearing table:', error);
    throw error;
  }
};

const insertClasses = async (data: CSVData[]) => {
  try {
    if (data.length === 0) {
      throw new Error('No data to insert');
    }

    console.log('Cleaning data before insertion...');
    // Clean and validate the data before insertion
    const cleanedData = data.map(row => ({
      SubCode: row.SubCode.trim(),
      Class: row.Class.trim(),
      Day: row.Day.trim(),
      StartTime: row.StartTime.trim(),
      EndTime: row.EndTime.trim(),
      Room: row.Room.trim(),
      Teacher: row.Teacher.trim()
    }));

    console.log('Sample cleaned data:', cleanedData[0]);
    console.log('Attempting to insert data...');

    const result = await prisma.class.createMany({
      data: cleanedData
    });

    console.log('Data inserted successfully:', {
      classes: result.count
    });

    return {
      classes: result.count
    };
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
};

const initDB = async () => {
  try {
    await clearTable();

    const csvFilePath = path.resolve(process.cwd(), 'public/classes.csv');
    console.log('Looking for CSV at:', csvFilePath);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at path: ${csvFilePath}`);
    }

    const csvText = fs.readFileSync(csvFilePath, 'utf8');
    console.log('CSV content preview:', csvText.substring(0, 200));
    console.log('Total CSV length:', csvText.length);

    if (!csvText.trim()) {
      throw new Error('CSV file is empty');
    }

    const parseResult = Papa.parse<CSVData>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const cleaned = header.trim();
        console.log(`Header found: ${header} -> ${cleaned}`);
        return cleaned;
      },
      transform: (value) => value.trim()
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
    }

    const fields = parseResult.meta.fields || [];
    if (fields.length === 0) {
      throw new Error('No headers found in CSV file');
    }

    const requiredFields = ['SubCode', 'Class', 'Day', 'StartTime', 'EndTime', 'Room', 'Teacher'];
    const missingFields = requiredFields.filter(field => !fields.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in CSV: ${missingFields.join(', ')}`);
    }

    console.log('Number of rows parsed:', parseResult.data.length);

    // Map CSV data to our database schema
    const validData: CSVData[] = parseResult.data
      .filter((row): row is CSVData => {
        const isValid = Boolean(
          row.SubCode && row.Class && row.Day && 
          row.StartTime && row.EndTime && row.Room && row.Teacher
        );
        if (!isValid) {
          console.log('Invalid row found:', row);
        }
        return isValid;
      });

    console.log('Number of valid rows:', validData.length);
    if (validData.length > 0) {
      console.log('Sample row:', validData[0]);
    }

    if (validData.length === 0) {
      throw new Error('No valid data found in CSV');
    }

    const result = await insertClasses(validData);
    return result;
  } catch (error) {
    console.error('Error in initDB:', error);
    throw error;
  }
};

export const runInitDB = async () => {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connection successful');

    console.log('Starting database initialization...');
    const result = await initDB();
    
    if (!result) {
      throw new Error('No data returned from initDB');
    }

    console.log('Database initialized with:', result);
    return { 
      success: true, 
      message: 'Database initialized successfully',
      ...result
    };
  } catch (err) {
    console.error('Error in runInitDB:', err);
    
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Unknown database initialization error';
      
    return { 
      success: false, 
      message: errorMessage,
      error: err
    };
  } finally {
    try {
      console.log('Disconnecting from database...');
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
};