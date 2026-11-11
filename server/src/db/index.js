
import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connection = await mongoose.connect(
    process.env.MONGODB_URI,
    {
      dbName: 'CampusFind'
    }
  );

  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection.connection;
};

export default connectDB;
