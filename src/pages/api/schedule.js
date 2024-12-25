import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const schedulePath = path.join(process.cwd(), 'public', 'professorSchedule.json');
    if (!fs.existsSync(schedulePath)) {
      throw new Error('Schedule data file not found');
    }
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    res.status(200).json(scheduleData);
  } catch (error) {
    console.error('Error reading schedule data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}