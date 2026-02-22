import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Platform Backend is running safely' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saarthi';

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => {
        console.log('✅ Successfully connected to MongoDB Database');
        app.listen(PORT, () => {
            console.log(`🚀 Saarthi Backend Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    });
