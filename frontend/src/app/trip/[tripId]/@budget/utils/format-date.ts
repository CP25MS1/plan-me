export const formatDate = (iso: string) => {
  const d = new Date(iso);

  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
  });
};
