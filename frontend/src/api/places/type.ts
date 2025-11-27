export type GoogleMapPlace = {
  ggmpId: string;
  rating: number;
  thName: string;
  thDescription: string;
  thAddress: string;
  enName: string;
  enDescription: string;
  enAddress: string;
  openingHours: string | null;
  defaultPicUrl: string | null;
};

// From Google Geocoding API

export type GeocodingResponse = {
  results: PlaceResult[];
  status: string;
};

export type PlaceResult = {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points: NavigationPoint[];
  partial_match: boolean;
  place_id: string;
  plus_code: PlusCode;
  types: string[];
};

export type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type Geometry = {
  location: LatLng;
  location_type: string;
  viewport: Viewport;
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type Viewport = {
  northeast: LatLng;
  southwest: LatLng;
};

export type NavigationPoint = {
  location: {
    latitude: number;
    longitude: number;
  };
};

export type PlusCode = {
  compound_code: string;
  global_code: string;
};
