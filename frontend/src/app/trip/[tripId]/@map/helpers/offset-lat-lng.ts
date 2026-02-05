export const offsetLatLng = (
  map: google.maps.Map,
  latLng: google.maps.LatLngLiteral,
  offsetY: number
): google.maps.LatLngLiteral => {
  const projection = map.getProjection();
  if (!projection) return latLng;

  const zoom = map.getZoom()!;
  const scale = Math.pow(2, zoom);

  const worldPoint = projection.fromLatLngToPoint(new google.maps.LatLng(latLng));
  if (!worldPoint) return latLng;

  const pixelOffset = offsetY / scale;

  const newPoint = new google.maps.Point(worldPoint.x, worldPoint.y + pixelOffset);

  const newLatLng = projection.fromPointToLatLng(newPoint);
  if (!newLatLng) return latLng;

  return {
    lat: newLatLng.lat(),
    lng: newLatLng.lng(),
  };
};
