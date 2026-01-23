import { useMutation } from '@tanstack/react-query';
import { readEmailInbox } from '@/api/reservations/api';
import { ReadEmailInboxRequest } from '@/api/reservations/type';

export const useReadEmailInbox = () => {
  return useMutation({
    mutationFn: (payload: ReadEmailInboxRequest) => readEmailInbox(payload),
  });
};
