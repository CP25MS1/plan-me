import { GoogleMapPlace } from '@/api/places';
import { WishlistPlace } from '@/api/trips';

const normalize = (s: string) => s.trim().toLowerCase();

export const filterGoogleMapPlacesByName = (
  places: GoogleMapPlace[],
  q: string
): GoogleMapPlace[] => {
  const query = normalize(q);
  if (!query) return places;

  return places.filter(
    (p) => normalize(p.thName).includes(query) || normalize(p.enName).includes(query)
  );
};

export const filterWishlistPlacesByName = (places: WishlistPlace[], q: string): WishlistPlace[] => {
  const query = normalize(q);
  if (!query) return places;

  return places.filter(
    (p) => normalize(p.place.th.name).includes(query) || normalize(p.place.en.name).includes(query)
  );
};
