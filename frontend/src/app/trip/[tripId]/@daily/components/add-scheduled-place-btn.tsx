'use client';

import { Button } from '@mui/material';
import { PlusIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { useAddScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import { CreateScheduledPlaceRequest } from '@/api/daily-plan';
import { addScheduledPlace } from '@/store/trip-detail-slice';
import ScheduledPlaceMapper from '@/app/trip/[tripId]/@daily/helpers/scheduled-place-mapper';

type AddScheduledPlaceProps = {
  tripId: number;
  payload: CreateScheduledPlaceRequest;
  onSuccess: () => void;
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
            addScheduledPlace({
              planId: res.planId,
              scheduledPlace: ScheduledPlaceMapper.mapResponseToState(res),
            })
          );
          onSuccess();
        },
      }
    );
  };

  return (
    <Button variant="contained" startIcon={<PlusIcon />} onClick={() => handleSave()}>
      เพิ่มสถานที่
    </Button>
  );
};

export default AddScheduledPlaceBtn;
