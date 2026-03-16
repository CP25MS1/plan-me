export type SupportedLocale = 'en' | 'th';

export const formatCurrency = (value: number | undefined | null, locale: SupportedLocale) => {
  if (value == null || Number.isNaN(value)) return locale === 'th' ? '฿0.00' : 'THB 0.00';

  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
