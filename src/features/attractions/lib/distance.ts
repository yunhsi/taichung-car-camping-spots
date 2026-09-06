interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocatedItem {
  latitude: number | null;
  longitude: number | null;
}

const EARTH_RADIUS_IN_KILOMETERS = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getDistanceInKilometers(
  origin: Coordinates,
  destination: Coordinates,
): number {
  const latitudeDifference = toRadians(
    destination.latitude - origin.latitude,
  );
  const longitudeDifference = toRadians(
    destination.longitude - origin.longitude,
  );
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_IN_KILOMETERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function sortByDistance<T extends LocatedItem>(
  items: readonly T[],
  origin: Coordinates,
): T[] {
  return items
    .map((item, originalIndex) => ({
      item,
      originalIndex,
      distance:
        item.latitude === null || item.longitude === null
          ? Number.POSITIVE_INFINITY
          : getDistanceInKilometers(origin, {
              latitude: item.latitude,
              longitude: item.longitude,
            }),
    }))
    .sort(
      (first, second) =>
        first.distance - second.distance ||
        first.originalIndex - second.originalIndex,
    )
    .map(({ item }) => item);
}
