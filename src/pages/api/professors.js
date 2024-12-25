import prisma from '../../lib/db';

const getFreeProfessors = async (req, res) => {
  try {
    const { day, time } = req.query;
    
    if (!day || !time) {
      return res.status(400).json({ error: 'Day and time parameters are required' });
    }

    console.log('Client day:', day);
    console.log('Client time:', time);
    
    // First, get currently busy professors
    const busyProfessors = await prisma.class.findMany({
      where: {
        Day: day,
        StartTime: { lte: time },
        EndTime: { gte: time },
      },
      select: {
        Teacher: true,
      },
    }, { cacheStrategy: { swr: 60 } });

    const busyProfessorsList = busyProfessors.map(c => c.Teacher);

    // Then, fetch professors that are free
    const freeProfessors = await prisma.class.findMany({
      where: {
        Teacher: {
          notIn: busyProfessorsList,
        },
      },
      select: {
        Teacher: true,
      },
      distinct: ['Teacher'], // Ensure distinct teachers
      orderBy: {
        Teacher: 'asc', // Sort teachers in ascending order
      },
    }, { cacheStrategy: { swr: 60 } });

    // Ensure a valid response structure
    res.status(200).json(freeProfessors.length ? freeProfessors.map(prof => prof.Teacher) : []);
  } catch (error) {
    console.error('Error fetching free professors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getFreeProfessors;
