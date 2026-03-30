/**
 * Normalise une valeur image de profil pour l'utiliser directement dans
 * `<Image source={{ uri }}>` :
 * - accepte les URL `http(s)`, les `data:` et les URI locales `file://`
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
  return `data:image/jpeg;base64,${t}`;
}
