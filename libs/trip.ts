import type {
  CreateTripApiPayload,
  MyPublishedTripVm,
  TripListItemApi,
} from '@/types/trip';

/**
 * Construit un ISO datetime à partir de la date et l'heure choisies.
 */
export function buildTripDepartureIso(tripDate: Date, tripTime: Date): string {
  const out = new Date(tripDate);
  out.setHours(tripTime.getHours(), tripTime.getMinutes(), 0, 0);
  return out.toISOString();
}

/**
 * Convertit un prix texte (ex: "45 000", "45000", "45000.50")
 * en chaîne décimale attendue par l'API (ex: "45000.00").
 */
export function normalizePriceInputToDecimalString(raw: string): string | null {
  const cleaned = raw.replace(/\s+/g, '').replace(',', '.').trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

/**
 * Valide et construit le payload de création trajet côté client.
 */
export function buildCreateTripPayload(input: {
  from: string;
  to: string;
  tripDate: Date | null;
  tripTime: Date | null;
  seats: number;
  price: string;
  comment: string;
}): { payload: CreateTripApiPayload | null; reason?: string } {
  const departureCity = input.from.trim();
  const arrivalCity = input.to.trim();
  if (!departureCity) return { payload: null, reason: 'Le lieu de départ est requis.' };
  if (!arrivalCity) return { payload: null, reason: 'Le lieu d’arrivée est requis.' };
  if (!input.tripDate || !input.tripTime) return { payload: null, reason: 'Date et heure requises.' };

  const pricePerSeat = normalizePriceInputToDecimalString(input.price);
  if (!pricePerSeat) return { payload: null, reason: 'Le prix par place est invalide.' };

  const payload: CreateTripApiPayload = {
    departureCity,
    arrivalCity,
    departureAt: buildTripDepartureIso(input.tripDate, input.tripTime),
    availableSeats: input.seats,
    pricePerSeat,
  };

  const description = input.comment.trim();
  if (description.length) payload.description = description;

  return { payload };
}

function toFrenchDateParts(iso: string): { whenLabel: string; departTime: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { whenLabel: 'Date inconnue', departTime: '--:--' };
  }
  return {
    whenLabel: date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }),
    departTime: date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
}

function parsePriceToNumber(value?: string | null): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Convertit les trajets API au format de l'écran "Mes trajets publiés".
 */
export function mapApiTripsToMyPublishedTrips(
  trips: TripListItemApi[],
  currentUserId: string,
): MyPublishedTripVm[] {
  return trips
    .slice()
    .sort((a, b) => new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime())
    .filter((t) => t.driverId === currentUserId)
    .map((t) => {
      const { whenLabel, departTime } = toFrenchDateParts(t.departureAt);
      return {
        id: t.id,
        from: t.departureCity,
        to: t.arrivalCity,
        whenLabel,
        departTime,
        priceGNF: parsePriceToNumber(t.pricePerSeat),
        placesTotal: t.availableSeats,
        placesBooked: Math.max(0, t.bookedSeats ?? 0),
      };
    });
}
