import { useMemo } from 'react';
import { MarkerF } from '@react-google-maps/api';
import { usePlaceGeometry } from '@/lib/google-maps';

const createNumberedPinSvg = (color: string, order: number, selected: boolean) => {
  const size = selected ? 34 : 30;

  return `
<svg
  width="${size}"
  height="${size + 10}"
  viewBox="0 0 40 50"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Shadow -->
  <ellipse
    cx="20"
    cy="44"
    rx="10"
    ry="3"
    fill="rgba(0,0,0,0.25)"
  />

  <!-- Round pin -->
  <path
    d="
      M20 4
      C10 4 4 12 4 20
      C4 28 20 44 20 44
      C20 44 36 28 36 20
      C36 12 30 4 20 4
      Z
    "
    fill="${color}"
    stroke="#fff"
    stroke-width="3"
  />

  <!-- Inner circle -->
  <circle
    cx="20"
    cy="20"
    r="9"
    fill="rgba(255,255,255,0.2)"
  />

  <!-- Number -->
  <text
    x="20"
    y="20"
    text-anchor="middle"
    dominant-baseline="middle"
    font-size="${selected ? 15 : 13}"
    font-weight="bold"
    fill="#fff"
  >
    ${order}
  </text>
</svg>
`;
};

const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

type PlaceMarkerProps = {
  placeId: string;
  order: number;
  color: string;
  selected?: boolean;
  onSelect?: () => void;
};

const PlaceMarker = ({ placeId, order, color, selected = false, onSelect }: PlaceMarkerProps) => {
  const { data } = usePlaceGeometry(placeId);
  const icon = useMemo(
    () => ({
      url: svgToDataUrl(createNumberedPinSvg(color, order, selected)),
      scaledSize: new google.maps.Size(selected ? 36 : 30, selected ? 54 : 45),
      anchor: new google.maps.Point(selected ? 18 : 15, selected ? 54 : 45),
    }),
    [color, order, selected]
  );

  if (!data) return null;

  return <MarkerF position={data} icon={icon} zIndex={selected ? 999 : 1} onClick={onSelect} />;
};

export default PlaceMarker;
