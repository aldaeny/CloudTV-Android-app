export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function httpsUrlError(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required.`;
  return isHttpsUrl(value.trim())
    ? null
    : `${label} must be a valid HTTPS URL to protect provider credentials.`;
}
