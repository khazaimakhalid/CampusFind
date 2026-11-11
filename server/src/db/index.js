
import mongoose from 'mongoose';

const connectDB = async () => {
  const connection = await mongoose.connect(
    process.env.MONGODB_URI,
    {
      dbName: 'CampusFind'
    }
  );

  console.log(
    `MongoDB connected: ${connection.connection.host}`
  );
};

export default connectDB;
