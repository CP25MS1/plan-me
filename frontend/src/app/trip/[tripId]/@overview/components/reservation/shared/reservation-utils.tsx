import React, { ReactNode } from 'react';
import {
  FlightDetails,
  ReservationDetails,
  ReservationDto,
  ReservationType,
} from '@/api/reservations/type';
import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';
import { fieldsByType } from '../../fields-by-type';

export type UiReservationType =
  | 'Lodging'
  | 'Restaurant'
  | 'Flight'
  | 'Train'
  | 'Bus'
  | 'Ferry'
  | 'CarRental';

export interface FlightPassengerFormValue {
  passengerName: string;
  seatNo: string;
}

const reservationTypeToUiTypeMap: Record<ReservationType, UiReservationType> = {
  LODGING: 'Lodging',
  RESTAURANT: 'Restaurant',
  FLIGHT: 'Flight',
  TRAIN: 'Train',
  BUS: 'Bus',
  FERRY: 'Ferry',
  CAR_RENTAL: 'CarRental',
};

const uiTypeToReservationTypeMap: Record<UiReservationType, ReservationType> = {
  Lodging: 'LODGING',
  Restaurant: 'RESTAURANT',
  Flight: 'FLIGHT',
  Train: 'TRAIN',
  Bus: 'BUS',
  Ferry: 'FERRY',
  CarRental: 'CAR_RENTAL',
};

export const reservationTypeToUiType = (type: ReservationType): UiReservationType =>
  reservationTypeToUiTypeMap[type];

export const uiTypeToReservationType = (type: UiReservationType): ReservationType =>
  uiTypeToReservationTypeMap[type];

export const mergeReservationWithDetails = (
  reservation: ReservationDto
): ReservationDto => ({
  ...reservation,
  ...(reservation.details ?? {}),
});

export const getFlightPassengers = (
  reservation: ReservationDto
): FlightPassengerFormValue[] => {
  const passengers = (reservation.details as FlightDetails | undefined)?.passengers ?? [];
  return passengers.length > 0
    ? passengers.map((passenger) => ({
        passengerName: passenger.passengerName ?? '',
        seatNo: passenger.seatNo ?? '',
      }))
    : [{ passengerName: '', seatNo: '' }];
};

export const validateReservationForm = (
  typeValue: UiReservationType,
  formData: ReservationDto | null,
  passengers: FlightPassengerFormValue[]
) => {
  const errors: Record<string, boolean> = {};
  let firstError: string | null = null;

  fieldsByType[typeValue].forEach((field) => {
    if (field.required && !formData?.[field.name as keyof ReservationDto]) {
      errors[field.name] = true;
      if (!firstError) firstError = field.name;
    }
  });

  if (typeValue === 'Flight') {
    passengers.forEach((passenger, index) => {
      if (!passenger.passengerName || !passenger.seatNo) {
        const key = `passenger-${index}`;
        errors[key] = true;
        if (!firstError) firstError = key;
      }
    });
  }

  return { errors, firstError };
};

export const buildReservationDetails = (
  typeValue: UiReservationType,
  formData: ReservationDto,
  passengers: FlightPassengerFormValue[]
): ReservationDetails => {
  const reservationType = uiTypeToReservationType(typeValue);
  const mergedFormData = formData as ReservationDto & Record<string, string>;

  if (reservationType === 'FLIGHT') {
    return {
      type: reservationType,
      airline: mergedFormData.airline ?? '',
      flightNo: mergedFormData.flightNo ?? '',
      boardingTime: mergedFormData.boardingTime ?? '',
      gateNo: mergedFormData.gateNo ?? '',
      departureAirport: mergedFormData.departureAirport ?? '',
      departureTime: mergedFormData.departureTime ?? '',
      arrivalAirport: mergedFormData.arrivalAirport ?? '',
      arrivalTime: mergedFormData.arrivalTime ?? '',
      flightClass: mergedFormData.flightClass ?? '',
      passengers: passengers.map((passenger) => ({
        passengerName: passenger.passengerName,
        seatNo: passenger.seatNo,
      })),
    };
  }

  return {
    type: reservationType,
    ...fieldsByType[typeValue].reduce((acc, field) => {
      acc[field.name] = mergedFormData[field.name] ?? '';
      return acc;
    }, {} as Record<string, string>),
  } as ReservationDetails;
};

export const buildReservationFromForm = (
  tripId: number,
  typeValue: UiReservationType,
  formData: ReservationDto,
  passengers: FlightPassengerFormValue[]
): ReservationDto => {
  const type = uiTypeToReservationType(typeValue);

  return {
    tripId,
    ggmpId: formData.ggmpId ?? null,
    bookingRef: formData.bookingRef ?? '',
    contactTel: formData.contactTel ?? '',
    contactEmail: formData.contactEmail ?? '',
    cost: Number(formData.cost) || 0,
    type,
    details: buildReservationDetails(typeValue, formData, passengers),
  };
};

export const isDuplicateReservation = (
  newRes: Partial<ReservationDto>,
  existingReservations: ReservationDto[],
  ignoredId?: number
): boolean => {
  if (newRes.type !== 'LODGING' && newRes.type !== 'RESTAURANT') return false;

  return existingReservations.some((res) => {
    if (ignoredId && res.id === ignoredId) return false;
    if (res.type !== newRes.type) return false;

    const formBookingRef = newRes.bookingRef?.trim();
    const existingBookingRef = res.bookingRef?.trim();

    if (formBookingRef && existingBookingRef && formBookingRef === existingBookingRef) {
      return true;
    }

    if (newRes.type === 'LODGING') {
      const newDetails = newRes.details as Record<string, string> | undefined;
      const existingDetails = res.details as Record<string, string> | undefined;
      const formName = newDetails?.lodgingName?.trim().toLowerCase();
      const formAddress = newDetails?.lodgingAddress?.trim().toLowerCase();
      const exName = existingDetails?.lodgingName?.trim().toLowerCase();
      const exAddress = existingDetails?.lodgingAddress?.trim().toLowerCase();
      
      const nameMatch = formName && exName && formName === exName;
      const addressMatch = formAddress && exAddress && formAddress === exAddress;
      if (nameMatch || addressMatch) return true;
    }

    if (newRes.type === 'RESTAURANT') {
      const newDetails = newRes.details as Record<string, string> | undefined;
      const existingDetails = res.details as Record<string, string> | undefined;
      const formName = newDetails?.restaurantName?.trim().toLowerCase();
      const formAddress = newDetails?.restaurantAddress?.trim().toLowerCase();
      const exName = existingDetails?.restaurantName?.trim().toLowerCase();
      const exAddress = existingDetails?.restaurantAddress?.trim().toLowerCase();

      const nameMatch = formName && exName && formName === exName;
      const addressMatch = formAddress && exAddress && formAddress === exAddress;
      if (nameMatch || addressMatch) return true;
    }

    return false;
  });
};

export const hasAnyDuplicate = (
  newReservations: Partial<ReservationDto>[],
  existingReservations: ReservationDto[]
): boolean => {
  return newReservations.some((nr) => isDuplicateReservation(nr, existingReservations));
};

export const renderReservationCard = (
  type: ReservationType | string,
  data: ReservationDto | null,
  passengerIndex?: number
): ReactNode => {
  switch (type) {
    case 'LODGING':
    case 'Lodging':
      return <LodgingCard data={data} />;
    case 'RESTAURANT':
    case 'Restaurant':
      return <RestaurantCard data={data} />;
    case 'FLIGHT':
    case 'Flight':
      return <FlightCard data={data} passengerIndex={passengerIndex ?? 0} />;
    case 'TRAIN':
    case 'Train':
      return <TrainCard data={data} />;
    case 'BUS':
    case 'Bus':
      return <BusCard data={data} />;
    case 'FERRY':
    case 'Ferry':
      return <FerryCard data={data} />;
    case 'CAR_RENTAL':
    case 'CarRental':
      return <CarRentalCard data={data} />;
    default:
      return null;
  }
};
