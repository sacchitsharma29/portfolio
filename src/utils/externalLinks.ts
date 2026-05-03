const PLACEHOLDER_HOSTS = new Set(['example.com', 'demo.example.com']);

export const isValidExternalUrl = (value?: string) => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !PLACEHOLDER_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const getExternalUrl = (value?: string) => (isValidExternalUrl(value) ? value : undefined);