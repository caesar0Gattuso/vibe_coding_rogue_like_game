export const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}m+`;
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k+`;
  }
  return score.toLocaleString();
};
