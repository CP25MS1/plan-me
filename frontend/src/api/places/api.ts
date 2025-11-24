import { apiClient } from '@/api/client';
import { geocodingClient } from './geocoding-client';
import { GoogleMapPlace, GeocodingResponse, PlaceResult } from './type';
import { Locale } from '@/store/i18n-slice';

export const searchForGeocoding = async ({
  address,
  language,
}: {
  address: string;
  language: Locale;
}) => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const {
    data: { results },
  } = await geocodingClient.get<GeocodingResponse>(
    `/json?address=${address}&language=${language}&key=${API_KEY}`
  );
  return results;
};

export type CombinedKeys = keyof PlaceResult | keyof GoogleMapPlace;

type KeyType<K> = K extends keyof GoogleMapPlace
  ? GoogleMapPlace[K]
  : K extends keyof PlaceResult
    ? PlaceResult[K]
    : unknown;

type ResultForKeys<K extends CombinedKeys> = {
  [P in K]: KeyType<P> | null;
};

type SearchPlacesProps<K extends CombinedKeys> = {
  keys: readonly K[];
  language?: Locale;
  q: string;
};

export const searchForPlaces = async <K extends CombinedKeys>({
  keys,
  q,
  language = 'th',
}: SearchPlacesProps<K>): Promise<Array<ResultForKeys<K>>> => {
  if (keys.length === 0) return [];

  const { data: googleMapPlaces } = await apiClient.get<GoogleMapPlace[]>(`/places/search?q=${q}`);

  // GEO CACHE (dedupe)
  const geocodeCache = new Map<string, Promise<PlaceResult[]>>();
  const ensureGeocode = (address: string | undefined): Promise<PlaceResult[]> => {
    if (!address) return Promise.resolve([]);
    if (!geocodeCache.has(address)) {
      geocodeCache.set(address, searchForGeocoding({ address, language }));
    }
    return geocodeCache.get(address)!;
  };

  const geocodePromises = googleMapPlaces.map((p) => ensureGeocode(p.enAddress ?? p.thAddress));
  const geocodeResultsArr = await Promise.all(geocodePromises);

  type Getter = (ctx: {
    place: GoogleMapPlace;
    geo: PlaceResult | undefined;
    language: Locale;
  }) => unknown;

  const extractors: Partial<Record<CombinedKeys, Getter>> = {
    address_components: ({ geo }) => geo?.address_components ?? null,
    formatted_address: ({ geo, place, language }) =>
      geo?.formatted_address ?? (language === 'en' ? place.enAddress : place.thAddress) ?? null,
    geometry: ({ geo }) => geo?.geometry ?? null,
    navigation_points: ({ geo }) => geo?.navigation_points ?? null,
    partial_match: ({ geo }) => geo?.partial_match ?? null,
    place_id: ({ geo, place }) => geo?.place_id ?? place.ggmpId ?? null,
    plus_code: ({ geo }) => geo?.plus_code ?? null,
    types: ({ geo }) => geo?.types ?? null,

    ggmpId: ({ place }) => place.ggmpId,
    rating: ({ place }) => place.rating,
    thName: ({ place }) => place.thName,
    thDescription: ({ place }) => place.thDescription,
    thAddress: ({ place }) => place.thAddress,
    enName: ({ place }) => place.enName,
    enDescription: ({ place }) => place.enDescription,
    enAddress: ({ place }) => place.enAddress,
    openingHours: ({ place }) => place.openingHours,
    defaultPicUrl: ({ place }) => place.defaultPicUrl,
  };

  return googleMapPlaces.map((place, i) => {
    const geo = geocodeResultsArr[i]?.[0];
    const ctx = { place, geo, language };

    const out = {} as ResultForKeys<K>;

    for (const k of keys) {
      const getter = extractors[k];
      const val = getter ? getter(ctx) : null;
      out[k] = val as KeyType<typeof k> | null;
    }

    return out;
  });
};
