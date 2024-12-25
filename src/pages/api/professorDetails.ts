import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const professors = await prisma.professor.findMany({
      select: {
        Name: true,
        Email: true
      },
      orderBy: {
        Name: 'asc'
      }
    });

    return res.status(200).json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return res.status(500).json({ message: 'Error fetching professors', error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 