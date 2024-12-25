import prisma from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Get unique list of teachers from the classes table
    const professors = await prisma.class.findMany({
      select: {
        Teacher: true,
      },
      distinct: ['Teacher'],
      orderBy: {
        Teacher: 'asc',
      },
    });

    // Transform the result to a simple array of professor names
    const professorList = professors.map(p => p.Teacher);

    return res.status(200).json(professorList);
  } catch (error) {
    console.error('Error fetching professors:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}