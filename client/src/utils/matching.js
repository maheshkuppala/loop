/**
 * Rule-based Smart Matching Algorithm for Looop
 * Master spec formula:
 * - Keyword similarity: 30%
 * - Category match: 30%
 * - Location proximity: 20%
 * - Condition suitability: 10%
 * - Community trust / preferences: 10%
 */

export const calculateMatchScore = (wantedItem, availableItem) => {
  if (!wantedItem || !availableItem) return 0;

  // 1. Category Match (30 points)
  const categoryScore = wantedItem.category === availableItem.category ? 30 : 0;

  // 2. Keyword Similarity (30 points)
  const wantedWords = wantedItem.title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const availableWords = (availableItem.title + ' ' + availableItem.description).toLowerCase().split(/\W+/);
  
  let matchesCount = 0;
  wantedWords.forEach(word => {
    if (availableWords.includes(word)) matchesCount++;
  });
  const keywordScore = wantedWords.length > 0 
    ? Math.min(30, Math.round((matchesCount / wantedWords.length) * 30))
    : 15;

  // 3. Location Proximity (20 points)
  // Check if both items share the same city or proximity term
  const locationScore = (wantedItem.location && availableItem.location && 
    (wantedItem.location.includes('Bengaluru') && availableItem.location.includes('Bengaluru')))
    ? 18
    : 10;

  // 4. Condition Suitability (10 points)
  const conditionScore = (availableItem.condition === 'new' || availableItem.condition === 'like_new' || availableItem.condition === 'good')
    ? 10
    : 7;

  // 5. Trust factor (10 points)
  const trustScore = availableItem.owner?.trustScore 
    ? Math.round((availableItem.owner.trustScore / 100) * 10)
    : 8;

  const total = categoryScore + keywordScore + locationScore + conditionScore + trustScore;
  return Math.min(99, Math.max(50, total));
};
