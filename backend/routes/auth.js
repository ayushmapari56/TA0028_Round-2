import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Register a new User (Student or Alumni)
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, college } = req.body;

        // Basic validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, password, and role are required' });
        }

        if (role === 'student' && !college) {
            return res.status(400).json({ message: 'College is required for students' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Create the new user (unverified state)
        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            college: role === 'student' ? college : undefined,
            isVerified: false,
            verificationOTP: hashedOTP,
            otpExpiresAt: otpExpires
        });

        const savedUser = await newUser.save();

        // Attempt to send email
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                await transporter.sendMail({
                    from: `"Saarthi Platform" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Verify your Saarthi account',
                    html: `<h2>Welcome to Saarthi!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
                });
                console.log(`✉️ OTP email sent to ${email}`);
            } else {
                console.log(`⚠️ Email credentials not set in .env. Falling back to console log.`);
                console.log(`----------`);
                console.log(`MOCK EMAIL TO: ${email}`);
                console.log(`SUBJECT: Verify your Saarthi account`);
                console.log(`BODY: Your verification code is: ${otp}`);
                console.log(`----------`);
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // We still return 201 so the UI can proceed, but note the email failure
        }

        res.status(201).json({
            message: 'User registered. Please verify your email.',
            requiresVerification: true,
            email: savedUser.email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Check if OTP is expired
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Validate OTP
        const isMatch = await bcrypt.compare(otp.toString(), user.verificationOTP);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid! Mark as verified
        user.isVerified = true;
        user.verificationOTP = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        // Generate the final JWT token now that they are verified
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

export default router;
