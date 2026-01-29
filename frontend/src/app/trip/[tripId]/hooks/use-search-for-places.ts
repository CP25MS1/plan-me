import { useQuery } from '@tanstack/react-query';
import { CombinedKeys, searchForPlaces, searchForProvince } from '@/api/places';
import { PLACES } from '@/constants/query-keys';
import { useI18nSelector } from '@/store/selectors';

export const useSearchForPlaces = (q: string) => {
  const { locale } = useI18nSelector();
  const expectedKeys: CombinedKeys[] = [
    'ggmpId',
    'thName',
    'enName',
    'thAddress',
    'enAddress',
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
        address: locale === 'th' ? p.thAddress : p.enAddress,
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

export const useSearchForProvince = (address: string) => {
  const { locale } = useI18nSelector();

  const query = useQuery({
    queryKey: [PLACES.PROVINCE, address.replaceAll(' ', '')],
    queryFn: () => searchForProvince({ address, language: locale }),
  });

  return {
    ...query,
    province: query.data ?? '',
  };
};

export default useSearchForPlaces;
