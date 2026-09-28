export function validateUrl(urlToTest: string): string | null {
  const trimmed = urlToTest.trim();
  if (!trimmed) return "URL address is required.";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "URL must begin with http:// or https://";
  }
  try {
    new URL(trimmed);
    return null;
  } catch {
    return "Please enter a valid, well-formed web address.";
  }
}

export function isValidUrl(url: string): boolean {
  return validateUrl(url) === null;
}
