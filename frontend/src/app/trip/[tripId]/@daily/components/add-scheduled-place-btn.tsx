'use client';

import { Button } from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { useAddScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { CreateScheduledPlaceRequest, ScheduledPlaceDto } from '@/api/daily-plan';
import { addScheduledPlace } from '@/store/trip-detail-slice';
import { ScheduledPlace } from '@/api/trips';

type AddScheduledPlaceProps = {
  tripId: number;
  payload: CreateScheduledPlaceRequest;
  onSuccess: () => void;
};

const mapResponseToState = (res: ScheduledPlaceDto): ScheduledPlace => {
  return {
    id: res.placeId,
    notes: res.notes ?? '',
    order: res.order,
    ggmp: res.placeDetail,
  };
};

const AddScheduledPlaceBtn = ({ tripId, payload, onSuccess }: AddScheduledPlaceProps) => {
  const dispatch = useDispatch();
  const { mutate } = useAddScheduledPlace();

  const handleSave = () => {
    mutate(
      { tripId, payload },
      {
        onSuccess: (res) => {
          dispatch(
            addScheduledPlace({ planId: res.planId, scheduledPlace: mapResponseToState(res) })
          );
          onSuccess();
        },
      }
    );
  };

  return (
    <Button variant='contained' startIcon={<PlusIcon />} onClick={() => handleSave()}>
      เพิ่มสถานที่
    </Button>
  );
};

export default AddScheduledPlaceBtn;
