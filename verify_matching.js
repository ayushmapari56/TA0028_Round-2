import mongoose from 'mongoose';
import { calculateSimilarity, calculateTotalScore } from './backend/utils/embeddings.js';

// Test Data
const studentGoals = ["Learn Web Development", "React projects", "Backend with Node.js"];
const mentorASkills = ["Web Development", "React", "JavaScript", "Frontend"];
const mentorBSkills = ["Python", "Data Science", "Machine Learning"];
const mentorCSkills = ["Node.js", "Express", "MongoDB", "Backend"];

console.log("--- Mentorship Matching Verification ---");

// 1. Verify Similarity Calculation
const simA = calculateSimilarity(studentGoals, mentorASkills);
const simB = calculateSimilarity(studentGoals, mentorBSkills);
const simC = calculateSimilarity(studentGoals, mentorCSkills);

console.log(`Similarity Student <-> Mentor A (Web Dev): ${simA.toFixed(2)}`);
console.log(`Similarity Student <-> Mentor B (Data): ${simB.toFixed(2)}`);
console.log(`Similarity Student <-> Mentor C (Backend): ${simC.toFixed(2)}`);

// 2. Verify Scoring Formula
const mentorA_Feedback = 4.5 * 2; // 9.0 on scalar 10
const mentorC_Feedback = 3.0 * 2; // 6.0 on scalar 10

const scoreA = calculateTotalScore({
    objective: simA * 10,
    feedback: mentorA_Feedback
});

const scoreC = calculateTotalScore({
    objective: simC * 10,
    feedback: mentorC_Feedback
});

console.log(`Final Score Mentor A: ${scoreA.toFixed(2)} (High similarity, High feedback)`);
console.log(`Final Score Mentor C: ${scoreC.toFixed(2)} (High similarity, Moderate feedback)`);

if (scoreA > scoreC && simA > simB) {
    console.log("✅ Verification Successful: Ranking logic follows weights and similarity.");
} else {
    console.log("❌ Verification Failed: Logic discrepancy found.");
}
