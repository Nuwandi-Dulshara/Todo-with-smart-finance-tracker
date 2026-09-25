export const formatCurrency = (value) => {
  const number = Number(value || 0)

  return `Rs. ${number.toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
