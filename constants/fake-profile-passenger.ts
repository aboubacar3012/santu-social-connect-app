/** Trajets réservés (passager) et trajets déjà effectués — démo */

export type ReservedAsPassenger = {
  /** Id dans `FAKE_TRIPS` pour ouvrir le détail */
  id: string;
  from: string;
  to: string;
  whenLabel: string;
  departTime: string;
  priceGNF: number;
  driverName: string;
  seats: number;
  bookingStatus: "confirmé" | "en attente";
};

export type CompletedTrip = {
  /** Peut correspondre à un ancien trajet ; le détail reste indicatif */
  id: string;
  from: string;
  to: string;
  /** Libellé date du trajet effectué */
  whenLabel: string;
  departTime: string;
  driverName: string;
  seats: number;
  priceGNF: number;
};

export const FAKE_MY_RESERVED_TRIPS: ReservedAsPassenger[] = [
  {
    id: "t2",
    from: "Conakry",
    to: "Kindia",
    whenLabel: "Demain",
    departTime: "14:30",
    priceGNF: 40_000,
    driverName: "Fatoumata Barry",
    seats: 1,
    bookingStatus: "confirmé",
  },
  {
    id: "t4",
    from: "Conakry",
    to: "Labé",
    whenLabel: "sam. 22 mars",
    departTime: "06:00",
    priceGNF: 200_000,
    driverName: "Mamadou Bah",
    seats: 2,
    bookingStatus: "en attente",
  },
];

export const FAKE_MY_COMPLETED_TRIPS: CompletedTrip[] = [
  {
    id: "t6",
    from: "Mamou",
    to: "Labé",
    whenLabel: "lun. 10 févr.",
    departTime: "11:00",
    driverName: "Aissatou Sow",
    seats: 1,
    priceGNF: 55_000,
  },
  {
    id: "t7",
    from: "Conakry",
    to: "Boké",
    whenLabel: "ven. 7 févr.",
    departTime: "08:00",
    driverName: "Thierno Diop",
    seats: 1,
    priceGNF: 120_000,
  },
];
