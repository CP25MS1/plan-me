export type ReservationType =
  | 'LODGING'
  | 'RESTAURANT'
  | 'FLIGHT'
  | 'TRAIN'
  | 'BUS'
  | 'FERRY'
  | 'CAR_RENTAL';

export interface ReservationDto {
  id?: number;
  tripId: number;
  ggmpId?: string | null;
  type: ReservationType;
  bookingRef?: string | null;
  contactTel?: string | null;
  contactEmail?: string | null;
  cost?: number;
  details?: ReservationDetails;
}

export type ReservationDetails =
  | LodgingDetails
  | RestaurantDetails
  | FlightDetails
  | TrainDetails
  | BusDetails
  | FerryDetails
  | CarRentalDetails;

/** Lodging */
export interface LodgingDetails {
  type: 'LODGING';
  lodgingName: string;
  lodgingAddress: string;
  underName: string;
  checkinDate: string;
  checkoutDate: string;
}

/** Restaurant */
export interface RestaurantDetails {
  type: 'RESTAURANT';
  restaurantName: string;
  restaurantAddress: string;
  underName: string;
  reservationDate: string;
  reservationTime?: string;
  tableNo?: string;
  queueNo?: string;
  partySize?: number;
}

/** Flight */
export interface FlightPassenger {
  passengerName: string;
  seatNo: string;
}

export interface FlightDetails {
  type: 'FLIGHT';
  airline: string;
  flightNo: string;
  boardingTime?: string;
  gateNo?: string;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  flightClass?: string;
  passengers?: FlightPassenger[];
}

/** Train */
export interface TrainDetails {
  type: 'TRAIN';
  trainNo: string;
  trainClass: string;
  seatClass: string;
  seatNo: string;
  passengerName: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  arrivalTime: string;
}

/** Bus */
export interface BusDetails {
  type: 'BUS';
  transportCompany: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  busClass?: string;
  passengerName: string;
  seatNo: string;
}

/** Ferry */
export interface FerryDetails {
  type: 'FERRY';
  transportCompany: string;
  passengerName: string;
  departurePort: string;
  departureTime: string;
  arrivalPort: string;
  arrivalTime: string;
  ticketType: string;
}

/** Car Rental */
export interface CarRentalDetails {
  type: 'CAR_RENTAL';
  rentalCompany: string;
  carModel: string;
  vrn: string;
  renterName: string;
  pickupLocation: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffTime: string;
}

export interface ReservationEmailInfo {
  emailId: number;
  sentAt: string;
  subject: string;
}

export interface PreviewReservationRequest {
  emailId: number;
  type: ReservationType;
}

export interface ReadEmailInboxRequest {
  emailIds: number[];
}

export interface ReadEmailInboxResponse {
  success: boolean;
}
