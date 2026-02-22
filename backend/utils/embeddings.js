/**
 * Simulates semantic similarity between two sets of text (e.g., skills/goals).
 * In a production environment, this would use OpenAI embeddings or Sentence Transformers.
 * 
 * @param {string[]} setA - Array of strings (e.g., student goals)
 * @param {string[]} setB - Array of strings (e.g., alumni skills)
 * @returns {number} - Similarity score between 0 and 1
 */
export const calculateSimilarity = (setA, setB) => {
    if (!setA || !setB || setA.length === 0 || setB.length === 0) return 0;

    const lowerA = setA.map(s => s.toLowerCase().trim());
    const lowerB = setB.map(s => s.toLowerCase().trim());

    // Simple Jaccard-inspired similarity for keywords
    // We treat each skill/goal as a token
    const intersection = lowerA.filter(token => lowerB.some(b => b.includes(token) || token.includes(b)));

    // We give higher weight to the student's primary goals
    const unionSize = new Set([...lowerA, ...lowerB]).size;

    if (unionSize === 0) return 0;

    return intersection.length / Math.sqrt(lowerA.length * lowerB.length); // Adjusted overlap
};

/**
 * Calculates current mentor total score based on weights
 * @param {Object} scores - { objective, feedback }
 * @returns {number} - 0 to 10
 */
export const calculateTotalScore = (scores) => {
    const { objective, feedback } = scores;
    return (objective * 0.3) + (feedback * 0.7);
};
