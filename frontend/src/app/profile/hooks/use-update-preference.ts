import { useMutation } from '@tanstack/react-query';

import { updatePreference, UserPreference } from '@/api/users';

export const useUpdatePreference = () => {
  return useMutation({
    mutationFn: (preference: UserPreference) => updatePreference(preference),
  });
};

export default useUpdatePreference;
