import prisma from '../../lib/db';

export default async function handler(req, res) {
  const { teacher, day, startTime, endTime } = req.query;

  if (!teacher || !day || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters'
    });
  }

  try {
    // Find classes that overlap with the requested time period for this teacher
    const overlappingClasses = await prisma.class.findMany({
      where: {
        Teacher: teacher,
        Day: day,
        AND: [
          {
            StartTime: {
              lte: endTime
            }
          },
          {
            EndTime: {
              gte: startTime
            }
          }
        ]
      },
      select: {
        SubCode: true,
        Class: true,
        Room: true,
        StartTime: true,
        EndTime: true
      },
      orderBy: {
        StartTime: 'asc'
      }
    });

    // If no overlapping classes found, the professor is available
    if (overlappingClasses.length === 0) {
      return res.status(200).json({
        available: true,
        classes: []
      });
    }

    // Professor is not available, return the classes they're teaching
    return res.status(200).json({
      available: false,
      classes: overlappingClasses.map(cls => ({
        SubCode: `${cls.SubCode} - ${cls.Class}`,
        Room: cls.Room,
        StartTime: cls.StartTime,
        EndTime: cls.EndTime
      }))
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
}
