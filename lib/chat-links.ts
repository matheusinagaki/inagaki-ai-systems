const PUBLIC_PROFILE_URLS = new Map([
  ["linkedin.com/in/matheusinagaki", "https://linkedin.com/in/matheusinagaki"],
  ["www.linkedin.com/in/matheusinagaki", "https://linkedin.com/in/matheusinagaki"],
  ["github.com/matheusinagaki", "https://github.com/matheusinagaki"],
]);

export function safePublicProfileUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    return PUBLIC_PROFILE_URLS.get(`${url.hostname.toLowerCase()}${normalizedPath}`) ?? null;
  } catch {
    return null;
  }
}
