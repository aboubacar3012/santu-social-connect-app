export type CreateTripApiPayload = {
  departureCity: string;
  arrivalCity: string;
  departureAt: string;
  availableSeats: number;
  pricePerSeat: string;
  description?: string;
};

export type TripApi = {
  id: string;
  driverId: string;
  departureCity: string;
  departureAddress?: string | null;
  arrivalCity: string;
  arrivalAddress?: string | null;
  departureAt: string;
  availableSeats: number;
  pricePerSeat?: string | null;
  description?: string | null;
  status: 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
};

export type CreateTripApiResponse = {
  trip: TripApi;
};

export type TripListItemApi = TripApi & {
  bookedSeats?: number;
  remainingSeats?: number;
  driver?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

export type ListTripsApiResponse = {
  trips: TripListItemApi[];
};

export type MyPublishedTripVm = {
  id: string;
  from: string;
  to: string;
  whenLabel: string;
  departTime: string;
  priceGNF: number;
  placesTotal: number;
  placesBooked: number;
};
