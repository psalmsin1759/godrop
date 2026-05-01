import { haversineKm } from "../utils/distance";

const SERVICE_FEE_KOBO = 10000; // ₦100
const PARCEL_BASE_FEE_KOBO = 50000; // ₦500
const PARCEL_PER_KM_KOBO = 8000; // ₦80/km
const SPEED_KMH = 25; // average Lagos speed

export function calcDeliveryFee(distanceKm: number): number {
  return Math.round(PARCEL_BASE_FEE_KOBO + distanceKm * PARCEL_PER_KM_KOBO);
}

export function calcEstimatedMinutes(distanceKm: number): number {
  return Math.round((distanceKm / SPEED_KMH) * 60) + 10; // +10 min buffer
}

export function parcelQuote(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number }
) {
  const distanceKm = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const deliveryFeeKobo = calcDeliveryFee(distanceKm);
  const serviceFeeKobo = SERVICE_FEE_KOBO;
  return {
    priceBreakdown: {
      deliveryFeeKobo,
      serviceFeeKobo,
      totalKobo: deliveryFeeKobo + serviceFeeKobo,
    },
    estimatedMinutes: calcEstimatedMinutes(distanceKm),
  };
}

export function truckQuote(
  apartmentType: { priceKobo: number },
  perKmKobo: number,
  perLoaderKobo: number,
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  numLoaders: number = 0,
  stops: { lat: number; lng: number }[] = []
) {
  const points = [pickup, ...stops, dropoff];
  let distanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distanceKm += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }

  const apartmentCostKobo = apartmentType.priceKobo;
  const kmCostKobo = Math.round(distanceKm * perKmKobo);
  const loadersCostKobo = numLoaders * perLoaderKobo;

  return {
    priceBreakdown: {
      apartmentCostKobo,
      distanceKm: Math.round(distanceKm * 10) / 10,
      kmCostKobo,
      loadersCostKobo,
      totalKobo: apartmentCostKobo + kmCostKobo + loadersCostKobo,
    },
    estimatedMinutes: calcEstimatedMinutes(distanceKm),
  };
}
