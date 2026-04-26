'use client';

import { Button } from '@mui/material';
import { PlusIcon } from 'lucide-react';

import { useAddScheduledPlace } from '@/app/trip/[tripId]/@daily/hooks/use-scheduled-place-mutation';
import type { CreateScheduledPlaceRequest } from '@/api/daily-plan';
import { useTranslation } from 'react-i18next';

type AddScheduledPlaceProps = {
  tripId: number;
  payload: CreateScheduledPlaceRequest;
  onSuccess: () => void;
};

const AddScheduledPlaceBtn = ({ tripId, payload, onSuccess }: AddScheduledPlaceProps) => {
  const { t } = useTranslation('trip_overview');
  const { mutate, isPending } = useAddScheduledPlace(tripId);

  return (
    <Button
      variant="contained"
      startIcon={<PlusIcon />}
      onClick={() => mutate(payload, { onSuccess })}
      disabled={isPending}
    >
      {t('daily.add_place')}
    </Button>
  );
};

export default AddScheduledPlaceBtn;
