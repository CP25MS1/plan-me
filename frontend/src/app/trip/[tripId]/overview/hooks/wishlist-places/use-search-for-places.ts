import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { searchForPlaces, CombinedKeys } from '@/api/places';
import { PLACES } from '@/constants/query-keys';

export const useSearchForPlaces = (q: string) => {
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const expectedKeys: CombinedKeys[] = [
    'ggmpId',
    'thName',
    'enName',
    'defaultPicUrl',
    'address_components',
  ] as const;
  const provinceKey = 'administrative_area_level_1';
  const normalizedQ = encodeURIComponent(q.toLowerCase());

  const query = useQuery({
    queryKey: [PLACES.SEARCH, normalizedQ],
    queryFn: () => searchForPlaces({ keys: expectedKeys, q: normalizedQ, language: locale }),
    enabled: q.length >= 3,
  });

  const { data } = query;
  const result =
    data?.map((p) => {
      return {
        ggmpId: p.ggmpId,
        name: locale === 'th' ? p.thName : p.enName,
        province:
          p.address_components?.find((comp) => comp.types.includes(provinceKey))?.long_name ?? null,
        defaultPicUrl: p.defaultPicUrl,
      };
    }) ?? [];

  return {
    ...query,
    data: result,
  };
};

export default useSearchForPlaces;
