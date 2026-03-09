export async function downloadBlobAndSave(url: string, filename: string): Promise<void> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download ${filename}: ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    window.URL.revokeObjectURL(objectUrl);
  }
}
