export const formatCurrencyTH = (value: number | undefined | null) => {
  if (value == null || Number.isNaN(value)) return '฿0.00';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
