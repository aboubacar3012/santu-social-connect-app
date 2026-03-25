/**
 * Données fictives pour tester le flux auth sans API.
 * Remplacez par un appel BDD quand l’endpoint « téléphone connu ? » existera.
 */

/** Normalise comme dans l’écran auth (chiffres uniquement, max 12). */
export function normalizeAuthPhoneDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 12);
}

/**
 * Numéros considérés comme déjà enregistrés (simulation BDD).
 * Ex. : saisir 621 00 00 001 → digits "621000001" si 9 chiffres, ou avec indicatif 224…
 */
export const FAKE_REGISTERED_PHONE_DIGITS: string[] = [
  '224621000001',
  '621000001',
  '224620000002',
  "0758020980"
];

/** Mot de passe accepté pour les numéros « déjà inscrits » (tests uniquement). */
export const FAKE_EXISTING_USER_PASSWORD = '12345678';

export function fakePhoneExistsInDatabase(digits: string): boolean {
  const n = normalizeAuthPhoneDigits(digits);
  if (n.length < 9) return false;
  return FAKE_REGISTERED_PHONE_DIGITS.some((registered) => {
    const r = normalizeAuthPhoneDigits(registered);
    return n === r || n.endsWith(r) || r.endsWith(n);
  });
}

export function fakeValidateLoginPassword(password: string): boolean {
  return password === FAKE_EXISTING_USER_PASSWORD;
}
