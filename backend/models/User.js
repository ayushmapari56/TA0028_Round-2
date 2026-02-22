import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'alumni'],
        required: true
    },

    // Base Profile Info
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },

    // OTP Verification Fields
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    otpExpiresAt: { type: Date },

    // Role Specific Fields
    college: {
        type: String,
        required: function () { return this.role === 'student'; }
    },
    graduationYear: { type: Number },
    currentCompany: { type: String }, // For alumni
    designation: { type: String }, // For alumni

    // Matching Fields
    skills: [{ type: String }],
    goals: [{ type: String }], // Primarily for students
    domain: { type: String }, // e.g., "Engineering", "Arts"
    availability: { type: Boolean, default: true },
    isDigiLockerVerified: { type: Boolean, default: false }, // For alumni

    // Scoring Metrics
    mentorScore: {
        objective: { type: Number, default: 0 }, // 0-10
        feedback: { type: Number, default: 0 }, // 0-10 average
        total: { type: Number, default: 0 }    // Weighted total
    },
    feedbackCount: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
