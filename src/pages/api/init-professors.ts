import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import prisma from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Clear existing professors
    await prisma.professor.deleteMany();
    console.log('Cleared existing professors');

    const csvFilePath = path.join(process.cwd(), 'public', 'professors.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records: any[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: false,
        trim: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    console.log(`Found ${records.length} professors to process`);

    // Process each record and insert into database
    const professors = records
      .filter(record => record[0] && record[0].trim()) // Filter out empty names
      .map(record => ({
        Name: record[0].trim(),
        Email: record[1]?.trim()
      }));

    // Insert all professors
    const result = await prisma.professor.createMany({
      data: professors,
      skipDuplicates: true
    });

    console.log(`Successfully added ${result.count} professors`);

    return res.status(200).json({
      success: true,
      message: `Successfully added ${result.count} professors to the database`
    });

  } catch (error) {
    console.error('Error initializing professors:', error);
    return res.status(500).json({
      success: false,
      message: 'Error initializing professors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 