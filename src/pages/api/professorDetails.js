import prisma from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    res.status(200).json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 