import { GoogleMapPlace } from '@/api/places';
import { WishlistPlace } from '@/api/trips';
import { normalizeIgnoringWhitespace } from '@/lib/string';

export const filterGoogleMapPlacesByName = (
  places: GoogleMapPlace[],
  q: string
): GoogleMapPlace[] => {
  const query = normalizeIgnoringWhitespace(q);
  if (!query) return places;

  return places.filter(
    (p) =>
      normalizeIgnoringWhitespace(p.thName).includes(query) ||
      normalizeIgnoringWhitespace(p.enName).includes(query)
  );
};

export const filterWishlistPlacesByName = (places: WishlistPlace[], q: string): WishlistPlace[] => {
  const query = normalizeIgnoringWhitespace(q);
  if (!query) return places;

  return places.filter(
    (p) =>
      normalizeIgnoringWhitespace(p.place.th.name).includes(query) ||
      normalizeIgnoringWhitespace(p.place.en.name).includes(query)
  );
};
