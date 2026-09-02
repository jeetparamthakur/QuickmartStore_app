export type UserLocation = {
  city: string;
  area: string;
  pincode: string;
  addressLine: string;
  latitude: number;
  longitude: number;
};

export type NearbyStore = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  deliveryRadius: number;
  isOpen: boolean;
  activeOrders: number;
  distanceKm: number;
  logo?: string;
};
