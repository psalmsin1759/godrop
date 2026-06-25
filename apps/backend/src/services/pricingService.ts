import { haversineKm } from "../utils/distance";

const SERVICE_FEE_KOBO = 10000; // ₦100
const PARCEL_BASE_FEE_KOBO = 50000; // ₦500
const PARCEL_PER_KM_KOBO = 8000; // ₦80/km
const SPEED_KMH = 25; // average Lagos speed

export function calcDeliveryFee(
  distanceKm: number,
  baseFeeKobo = PARCEL_BASE_FEE_KOBO,
  perKmKobo = PARCEL_PER_KM_KOBO
): number {
  return Math.round(baseFeeKobo + distanceKm * perKmKobo);
}

export function calcEstimatedMinutes(distanceKm: number): number {
  return Math.round((distanceKm / SPEED_KMH) * 60) + 10; // +10 min buffer
}

export function parcelQuote(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  vehicleType?: { baseFeeKobo: number; perKmKobo: number }
) {
  const distanceKm = haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const deliveryFeeKobo = calcDeliveryFee(
    distanceKm,
    vehicleType?.baseFeeKobo,
    vehicleType?.perKmKobo
  );
  const serviceFeeKobo = SERVICE_FEE_KOBO;
  return {
    priceBreakdown: {
      deliveryFeeKobo,
      serviceFeeKobo,
      totalKobo: deliveryFeeKobo + serviceFeeKobo,
    },
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedMinutes: calcEstimatedMinutes(distanceKm),
  };
}

/**
 * Quote for a multi-parcel order: each parcel is priced independently as
 * pickup → its drop-off (base fee + per-km). The order total is the sum of all
 * parcel delivery fees plus a single service fee. Reuses `parcelQuote` per leg.
 */
export function parcelQuoteMulti(
  pickup: { lat: number; lng: number },
  dropoffs: { lat: number; lng: number }[],
  vehicleType?: { baseFeeKobo: number; perKmKobo: number }
) {
  const parcels = dropoffs.map((dropoff) => {
    const q = parcelQuote(pickup, dropoff, vehicleType);
    return {
      deliveryFeeKobo: q.priceBreakdown.deliveryFeeKobo,
      distanceKm: q.distanceKm,
      estimatedMinutes: q.estimatedMinutes,
    };
  });

  const deliveryFeeKobo = parcels.reduce((s, p) => s + p.deliveryFeeKobo, 0);
  const serviceFeeKobo = SERVICE_FEE_KOBO;
  // Stops are visited sequentially, so the order ETA is the sum of legs.
  const estimatedMinutes = parcels.reduce((s, p) => s + p.estimatedMinutes, 0);

  return {
    parcels,
    priceBreakdown: {
      deliveryFeeKobo,
      serviceFeeKobo,
      totalKobo: deliveryFeeKobo + serviceFeeKobo,
    },
    estimatedMinutes,
  };
}

export function truckQuote(
  apartmentType: { priceKobo: number },
  perKmKobo: number,
  perLoaderKobo: number,
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  numLoaders: number = 0,
  stops: { lat: number; lng: number }[] = [],
  truckType?: { baseFeeKobo: number }
) {
  const points = [pickup, ...stops, dropoff];
  let distanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distanceKm += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
  }

  const apartmentCostKobo = apartmentType.priceKobo;
  const kmCostKobo = Math.round(distanceKm * perKmKobo);
  const loadersCostKobo = numLoaders * perLoaderKobo;
  const truckCostKobo = truckType?.baseFeeKobo ?? 0;

  return {
    priceBreakdown: {
      apartmentCostKobo,
      distanceKm: Math.round(distanceKm * 10) / 10,
      kmCostKobo,
      loadersCostKobo,
      truckCostKobo,
      totalKobo: apartmentCostKobo + kmCostKobo + loadersCostKobo + truckCostKobo,
    },
    estimatedMinutes: calcEstimatedMinutes(distanceKm),
  };
}
