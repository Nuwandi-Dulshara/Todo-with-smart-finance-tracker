export const getBudgetStatus = (usedPercentage) => {
  if (usedPercentage > 100) return 'Exceeded'
  if (usedPercentage >= 90) return 'Critical'
  if (usedPercentage >= 70) return 'Warning'
  return 'Safe'
}
