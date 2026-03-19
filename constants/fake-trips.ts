export type Trip = {
  id: string;
  from: string;
  to: string;
  whenLabel: "Aujourd’hui" | "Demain";
  departTime: string; // "HH:MM"
  durationLabel: string;
  seatsLeft: number;
  priceEUR: number;
  driverName: string;
  carLabel: string;
  distanceLabel: string;
  tags: string[];
};

export const FAKE_TRIPS: Trip[] = [
  {
    id: "t1",
    from: "Paris",
    to: "Lyon",
    whenLabel: "Aujourd’hui",
    departTime: "08:30",
    durationLabel: "4h 10",
    seatsLeft: 2,
    priceEUR: 25,
    driverName: "Sofiane",
    carLabel: "Peugeot 308",
    distanceLabel: "420 km",
    tags: ["Climatisation", "Bagages ok"],
  },
  {
    id: "t2",
    from: "Paris",
    to: "Lyon",
    whenLabel: "Aujourd’hui",
    departTime: "12:15",
    durationLabel: "4h 25",
    seatsLeft: 4,
    priceEUR: 21,
    driverName: "Nora",
    carLabel: "Renault Clio",
    distanceLabel: "420 km",
    tags: ["Parlant français", "Musique"],
  },
  {
    id: "t3",
    from: "Lyon",
    to: "Marseille",
    whenLabel: "Aujourd’hui",
    departTime: "16:00",
    durationLabel: "2h 10",
    seatsLeft: 1,
    priceEUR: 18,
    driverName: "Karim",
    carLabel: "Volkswagen Golf",
    distanceLabel: "300 km",
    tags: ["Silencieux", "Wi‑Fi"],
  },
  {
    id: "t4",
    from: "Toulouse",
    to: "Bordeaux",
    whenLabel: "Aujourd’hui",
    departTime: "09:20",
    durationLabel: "2h 10",
    seatsLeft: 3,
    priceEUR: 16,
    driverName: "Emma",
    carLabel: "Seat Leon",
    distanceLabel: "245 km",
    tags: ["Café offert", "Climatisation"],
  },
  {
    id: "t5",
    from: "Marseille",
    to: "Nice",
    whenLabel: "Demain",
    departTime: "07:40",
    durationLabel: "2h 10",
    seatsLeft: 2,
    priceEUR: 15,
    driverName: "Alex",
    carLabel: "Toyota Yaris",
    distanceLabel: "200 km",
    tags: ["Arrêt possible", "Bagages ok"],
  },
  {
    id: "t6",
    from: "Lille",
    to: "Paris",
    whenLabel: "Demain",
    departTime: "10:05",
    durationLabel: "2h 55",
    seatsLeft: 5,
    priceEUR: 14,
    driverName: "Chloé",
    carLabel: "Citroën C3",
    distanceLabel: "230 km",
    tags: ["Porte-chargement", "Climatisation"],
  },
  {
    id: "t7",
    from: "Nice",
    to: "Aix-en-Provence",
    whenLabel: "Demain",
    departTime: "14:20",
    durationLabel: "1h 10",
    seatsLeft: 2,
    priceEUR: 9,
    driverName: "Mourad",
    carLabel: "Renault Megane",
    distanceLabel: "70 km",
    tags: ["Trajet rapide", "Confort"],
  },
];

/** Villes uniques extraites des trajets (pour l'autocomplete) */
export const CITIES = Array.from(
  new Set(FAKE_TRIPS.flatMap((t) => [t.from, t.to]))
).sort();
