import type { UserLocation, NearbyStore } from '@/types/location';
import type { Store } from '@/types/store';
import type { Product, NearbyProduct } from '@/types/product';

/** Haversine distance in kilometres between two coordinates */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

type StoreWithGeo = Store & {
  city?: string;
  pincode?: string;
  serviceablePincodes?: string[];
};

export type ServiceableStore = StoreWithGeo & { distanceKm: number };

/** Stores where customer is within seller's deliveryRadius */
export function findServiceableStores(
  stores: StoreWithGeo[],
  location: UserLocation
): ServiceableStore[] {
  return stores
    .filter((s) => s.latitude != null && s.longitude != null && s.isOpen)
    .map((s) => ({
      ...s,
      distanceKm: getDistanceKm(
        location.latitude,
        location.longitude,
        s.latitude!,
        s.longitude!
      ),
    }))
    .filter((s) => {
      const cityMatch =
        !s.city || s.city.toLowerCase() === location.city.toLowerCase();
      const withinRadius = s.distanceKm <= s.deliveryRadius;
      return cityMatch && withinRadius;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function findServiceableStoreIds(
  stores: StoreWithGeo[],
  location: UserLocation
): string[] {
  return findServiceableStores(stores, location).map((s) => s.id);
}

/** Filter and sort stores by user location (city + delivery radius) */
export function findNearbyStores(
  stores: StoreWithGeo[],
  location: UserLocation
): NearbyStore[] {
  return findServiceableStores(stores, location).map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    address: s.address,
    city: s.city ?? '',
    pincode: s.pincode ?? '',
    latitude: s.latitude!,
    longitude: s.longitude!,
    deliveryRadius: s.deliveryRadius,
    isOpen: s.isOpen,
    activeOrders: s.activeOrders,
    logo: s.logo,
    distanceKm: s.distanceKm,
  }));
}

/** Products visible only if customer's location is within store deliveryRadius */
export function findNearbyProducts(
  products: Product[],
  stores: StoreWithGeo[],
  location: UserLocation
): NearbyProduct[] {
  const serviceable = findServiceableStores(stores, location);
  const storeMap = new Map(serviceable.map((s) => [s.id, s]));

  return products
    .filter((p) => p.status === 'active' && p.storeId && storeMap.has(p.storeId))
    .map((p) => {
      const store = storeMap.get(p.storeId!)!;
      return {
        ...p,
        storeId: p.storeId!,
        storeName: store.name,
        distanceKm: store.distanceKm,
        deliveryRadiusKm: store.deliveryRadius,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
}

/** Check if a specific store can serve the customer location */
export function isCustomerWithinStoreRadius(
  store: StoreWithGeo,
  location: UserLocation
): boolean {
  if (!store.latitude || !store.longitude || !store.isOpen) return false;
  const distance = getDistanceKm(
    location.latitude,
    location.longitude,
    store.latitude,
    store.longitude
  );
  const cityMatch =
    !store.city || store.city.toLowerCase() === location.city.toLowerCase();
  return cityMatch && distance <= store.deliveryRadius;
}

/** Whether a delivery partner is within the store's pickup radius */
export function isPartnerWithinPickupRadius(
  partnerLat: number,
  partnerLng: number,
  storeLat: number,
  storeLng: number,
  partnerPickupRadiusKm: number
): boolean {
  const distance = getDistanceKm(partnerLat, partnerLng, storeLat, storeLng);
  return distance <= partnerPickupRadiusKm;
}

/** Whether store has valid geo location set */
export function isStoreLocationComplete(store: StoreWithGeo): boolean {
  return (
    !!store.latitude &&
    !!store.longitude &&
    !!store.city &&
    !!store.pincode &&
    store.pincode.length === 6
  );
}
