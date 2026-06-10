/** URL hôte/chemin sans schéma (ex. `cdn.example.com/uploads/…`). */
function isBareHttpUrl(value: string): boolean {
  return /^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(\/|$)/.test(value);
}

/**
 * Normalise une valeur image de profil pour l'utiliser directement dans
 * `<Image source={{ uri }}>` :
 * - accepte les URL `http(s)`, les `data:` et les URI locales `file://`
 * - préfixe `https://` aux URL stockées sans schéma (CloudFront, etc.)
 * - transforme un base64 "nu" legacy en data URL JPEG.
 */
export function resolveProfileImageUri(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t.length) return null;
  if (
    t.startsWith('data:') ||
    t.startsWith('file://') ||
    t.startsWith('http://') ||
    t.startsWith('https://')
  ) {
    return t;
  }
  if (t.startsWith('//')) {
    return `https:${t}`;
  }
  if (isBareHttpUrl(t)) {
    return `https://${t}`;
  }
  return `data:image/jpeg;base64,${t}`;
}
