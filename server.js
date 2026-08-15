import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './backend/config/db.js';
import { seedDatabase } from './backend/seed.js';
import { errorHandler } from './backend/middleware/errorHandler.js';

import parkingSpaceRoutes from './backend/routes/parkingSpaceRoutes.js';
import vehicleRoutes from './backend/routes/vehicleRoutes.js';
import customerRoutes from './backend/routes/customerRoutes.js';
import parkingSessionRoutes from './backend/routes/parkingSessionRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
import pricingRoutes from './backend/routes/pricingRoutes.js';
import dashboardRoutes from './backend/routes/dashboardRoutes.js';
import authRoutes from './backend/routes/authRoutes.js';

dotenv.config();

const app = express();

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/parking-spaces`, parkingSpaceRoutes);
  app.use(`${prefix}/vehicles`, vehicleRoutes);
  app.use(`${prefix}/customers`, customerRoutes);
  app.use(`${prefix}/parking-sessions`, parkingSessionRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/pricing`, pricingRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.get(`${prefix}/health`, (req, res) => {
    res.json({ status: 'ok', service: 'Car Parking Management System API' });
  });
};

registerRoutes('/api');
registerRoutes('');

// Error Handler Middleware
app.use(errorHandler);

export { app };

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Connect Database & Seed initial data
  await connectDB();
  await seedDatabase();

  // Vite Dev Server or Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    // Loaded dynamically, ONLY for local dev. 'vite' is a heavy build-time
    // tool — it must never be imported at the top of this file, because
    // Vercel loads this same file inside a serverless function. A top-level
    // `import ... from 'vite'` forces Vercel to bundle/initialize it on
    // every cold start, which is a common cause of FUNCTION_INVOCATION_FAILED.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Car Parking Management System Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
