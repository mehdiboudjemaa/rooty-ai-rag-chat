import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db/schema/resources.ts' // Adjust the import based on your setup

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const resources = await db.select().from('resources') // Adjust based on your database setup
      res.status(200).json(resources)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resources' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
