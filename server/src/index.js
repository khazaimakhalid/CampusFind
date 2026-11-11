
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./db/index.js');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CampusFind server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
