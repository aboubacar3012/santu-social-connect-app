/** Données de démo : trajets publiés par l’utilisateur connecté et réservations */

export type TripBookingStatus = "confirmé" | "en attente";

export type TripBooking = {
  id: string;
  passengerName: string;
  seats: number;
  status: TripBookingStatus;
};

export type MyPublishedTrip = {
  id: string;
  from: string;
  to: string;
  whenLabel: string;
  departTime: string;
  priceGNF: number;
  /** Places totales proposées */
  placesTotal: number;
  bookings: TripBooking[];
};

/** Les `id` correspondent à des entrées de `FAKE_TRIPS` pour ouvrir le détail annonce. */
export const FAKE_MY_PUBLISHED_TRIPS: MyPublishedTrip[] = [
  {
    id: "t1",
    from: "Conakry",
    to: "Kindia",
    whenLabel: "Aujourd’hui",
    departTime: "07:00",
    priceGNF: 45_000,
    placesTotal: 4,
    bookings: [
      {
        id: "b1",
        passengerName: "Mariama Diallo",
        seats: 1,
        status: "confirmé",
      },
      {
        id: "b2",
        passengerName: "Alsény Camara",
        seats: 1,
        status: "en attente",
      },
      {
        id: "b3",
        passengerName: "Fatoumata Sylla",
        seats: 1,
        status: "confirmé",
      },
    ],
  },
  {
    id: "t3",
    from: "Conakry",
    to: "Labé",
    whenLabel: "Après-demain",
    departTime: "05:30",
    priceGNF: 180_000,
    placesTotal: 6,
    bookings: [
      {
        id: "b4",
        passengerName: "Ibrahim Touré",
        seats: 2,
        status: "confirmé",
      },
    ],
  },
  {
    id: "t5",
    from: "Kindia",
    to: "Mamou",
    whenLabel: "dim. 23 mars",
    departTime: "09:15",
    priceGNF: 35_000,
    placesTotal: 3,
    bookings: [],
  },
];

export function placesBookedForTrip(trip: MyPublishedTrip): number {
  return trip.bookings.reduce((s, b) => s + b.seats, 0);
}
