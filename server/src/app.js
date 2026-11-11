
import express from 'express';
import cors from 'cors';
import connectDB from './db/index.js';

import userRouter from './routes/user.routes.js';
import itemRouter from './routes/item.routes.js';
import foundRequestRouter from './routes/foundRequest.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import uploadRouter from './routes/upload.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.100.12:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins
}));


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.get('/api/v1/healthcheck', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusFind API is running'
  });
});
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/found-requests', foundRequestRouter);
app.use('/api/v1/uploads', uploadRouter);
app.post('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST route is working'
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler must be registered last
app.use(errorHandler);

export default app;
