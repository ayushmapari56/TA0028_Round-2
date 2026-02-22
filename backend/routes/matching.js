import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { calculateSimilarity, calculateTotalScore } from '../utils/embeddings.js';

const router = express.Router();

/**
 * GET /api/matching/recommend
 * Recommends top mentors for the current student
 */
router.get('/recommend', authenticate, async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student || student.role !== 'student') {
            return res.status(403).json({ message: 'Only students can request recommendations' });
        }

        // 1. Fetch potential alumni (verified and available)
        // Rule-Based Filters (Step 3 in diagram)
        const potentialAlumni = await User.find({
            role: 'alumni',
            availability: true,
            isDigiLockerVerified: true,
            // Optional: Filter by domain if student has one specified
            ...(student.domain ? { domain: student.domain } : {})
        });

        // 2. Processing (NLP Similarity and Scoring)
        const recommendations = potentialAlumni.map(alumni => {
            // NLP Similarity (Step 1 & 2)
            const similarity = calculateSimilarity(student.goals || [], alumni.skills || []);

            // Score calculation (Step 4)
            // Total Score = (SimilarityScore * 0.3) + (FeedbackScore * 0.7)
            // We use similarity as the "Objective" part of the score here
            const objectiveScore = similarity * 10; // Scalar to 10
            const feedbackScore = alumni.mentorScore.feedback || 0;

            const totalScore = calculateTotalScore({
                objective: objectiveScore,
                feedback: feedbackScore
            });

            return {
                id: alumni._id,
                firstName: alumni.firstName,
                lastName: alumni.lastName,
                currentCompany: alumni.currentCompany,
                designation: alumni.designation,
                skills: alumni.skills,
                isVerified: alumni.isDigiLockerVerified,
                similarity: similarity.toFixed(2),
                score: totalScore.toFixed(2)
            };
        });

        // 3. Ranking & Selection (Step 5)
        recommendations.sort((a, b) => b.score - a.score);

        // Limit to Top 5
        const topN = recommendations.slice(0, 5);

        res.json(topN);

    } catch (error) {
        console.error('Matching Error:', error);
        res.status(500).json({ message: 'Server error during matching' });
    }
});

/**
 * POST /api/matching/feedback
 * Allows student to submit feedback for a mentor (Step 6 / Feedback Loop)
 */
router.post('/feedback', authenticate, async (req, res) => {
    try {
        const { mentorId, rating } = req.body; // rating 1-5

        if (!mentorId || !rating) {
            return res.status(400).json({ message: 'Mentor ID and rating are required' });
        }

        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== 'alumni') {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Update feedback metrics
        const newCount = (mentor.feedbackCount || 0) + 1;
        const currentFeedback = mentor.mentorScore.feedback || 0;

        // Rolling average (simplified)
        // Convert 1-5 rating to 0-10 scale
        const normalizedRating = rating * 2;
        const newFeedbackAverage = ((currentFeedback * (newCount - 1)) + normalizedRating) / newCount;

        mentor.mentorScore.feedback = newFeedbackAverage;
        mentor.feedbackCount = newCount;

        // Recalculate total
        mentor.mentorScore.total = calculateTotalScore({
            objective: mentor.mentorScore.objective,
            feedback: newFeedbackAverage
        });

        await mentor.save();

        res.json({ message: 'Feedback submitted successfully', newScore: mentor.mentorScore.total });

    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ message: 'Server error during feedback submission' });
    }
});

export default router;
