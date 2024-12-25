import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const schedulePath = path.join(process.cwd(), 'public', 'professorSchedule.json');
    console.log('Attempting to read schedule from:', schedulePath);
    
    if (!fs.existsSync(schedulePath)) {
      console.error('Schedule file not found at:', schedulePath);
      throw new Error('Schedule data file not found');
    }

    const fileContent = fs.readFileSync(schedulePath, 'utf8');
    console.log('Successfully read file, parsing JSON...');
    
    const scheduleData = JSON.parse(fileContent);
    console.log('Successfully parsed JSON data');
    
    if (!Array.isArray(scheduleData)) {
      console.error('Invalid data format: expected array, got:', typeof scheduleData);
      throw new Error('Invalid schedule data format');
    }

    res.status(200).json(scheduleData);
  } catch (error) {
    console.error('Error reading schedule data:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}