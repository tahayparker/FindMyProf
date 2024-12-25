import { NextApiRequest, NextApiResponse } from 'next';
import { runInitDB } from '../../utils/init-db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  try {
    console.log('Starting database initialization...');
    const result = await runInitDB();
    console.log('Initialization result:', result);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      console.error('Database initialization failed:', result);
      return res.status(500).json({
        success: false,
        message: result.message || 'Unknown error occurred',
        error: result.error
      });
    }
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: String(error)
    });
  }
}
