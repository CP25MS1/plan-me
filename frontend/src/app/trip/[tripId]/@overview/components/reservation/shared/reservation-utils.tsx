import React, { ReactNode } from 'react';
import { ReservationDto, ReservationType } from '@/api/reservations/type';
import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';

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
      const formName = (newRes.details as any)?.lodgingName?.trim().toLowerCase();
      const formAddress = (newRes.details as any)?.lodgingAddress?.trim().toLowerCase();
      const exName = (res.details as any)?.lodgingName?.trim().toLowerCase();
      const exAddress = (res.details as any)?.lodgingAddress?.trim().toLowerCase();
      
      const nameMatch = formName && exName && formName === exName;
      const addressMatch = formAddress && exAddress && formAddress === exAddress;
      if (nameMatch || addressMatch) return true;
    }

    if (newRes.type === 'RESTAURANT') {
      const formName = (newRes.details as any)?.restaurantName?.trim().toLowerCase();
      const formAddress = (newRes.details as any)?.restaurantAddress?.trim().toLowerCase();
      const exName = (res.details as any)?.restaurantName?.trim().toLowerCase();
      const exAddress = (res.details as any)?.restaurantAddress?.trim().toLowerCase();

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
  data: any,
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
