// components/DeliveryMap.tsx
import { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography } from '@mui/material';
import { Order, User } from '@/types';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as {_getIconUrl?: string})._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Custom icons
const deliveryBoyIcon = new L.Icon({
  iconUrl: '/leaflet/delivery-boy.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const orderIcon = new L.Icon({
  iconUrl: '/leaflet/order.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface DeliveryMapProps {
  mapCenter: [number, number];
  user: User | null;
  orders: Order[];
}

const DeliveryMap: FC<DeliveryMapProps> = ({ mapCenter, user, orders }) => {
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Delivery Boy Location */}
      {user?.deliveryDetails?.currentLocation && (
        <Marker
          position={[user.deliveryDetails.currentLocation.latitude, user.deliveryDetails.currentLocation.longitude]}
          icon={deliveryBoyIcon}
        >
          <Popup>
            <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>Your Location</Typography>
          </Popup>
        </Marker>
      )}
      {/* Order Locations */}
      {orders?.map((order: Order) =>
        order.geoLocation ? (
          <Marker
            key={order._id}
            position={[order.geoLocation.latitude, order.geoLocation.longitude]}
            icon={orderIcon}
          >
            <Popup>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Order ID: {order._id}
                <br />
                Address: {order.shippingAddress.street}, {order.shippingAddress.city}
              </Typography>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
};

export default DeliveryMap;