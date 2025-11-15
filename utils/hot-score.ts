export function calculateHotScore(likeCount: number, createdAt: Date): number {
  const ageSeconds = (Date.now() - createdAt.getTime()) / 1000;
  const hot = Math.log10(1 + likeCount) - ageSeconds / 45000;
  return Number(hot.toFixed(6));
}
