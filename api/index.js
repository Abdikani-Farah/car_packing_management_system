import { app } from '../server.js';
import { connectDB } from '../backend/config/db.js';
import { seedDatabase } from '../backend/seed.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('Error in Vercel API handler setup:', error);
  }
  return app(req, res);
}
