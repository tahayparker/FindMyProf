import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import prisma from '../../lib/db';

interface ProfessorRecord {
  Name: string;
  Email: string;
}

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

    const records: ProfessorRecord[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: false,
        trim: true,
        skip_empty_lines: true
      }, (err, records: [string, string?][]) => {
        if (err) reject(err);
        else resolve(records.map(([name, email]) => ({
          Name: name.trim(),
          Email: email?.trim() || ''  // Default to empty string if email is undefined
        })));
      });
    });

    console.log(`Found ${records.length} professors to process`);

    // Process each record and insert into database
    const professors = records
      .filter(record => record.Name && record.Name.trim()) // Filter out empty names
      .map(record => ({
        Name: record.Name,
        Email: record.Email
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