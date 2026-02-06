"use client";

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { ILocation } from './DeliveryBoyDashboard';
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from 'react';

interface ILiveMapProps {
      userLocation: ILocation,
      deliveryBoyLocation: ILocation
}

function Recenter({ positions }: { positions: [number, number] }) {

      const map = useMap();

      useEffect(() => {
            if (positions[0] !== 0 && positions[1] !== 0) {
                  map.setView(positions, map.getZoom(), { animate: true })
            }
      }, [positions, map])

      return null;
}

const LiveMap = ({ userLocation, deliveryBoyLocation }: ILiveMapProps) => {
      // ✅ Do not mount map until valid coordinates exist
      const hasUserLocation =
            userLocation.latitude !== 0 && userLocation.longitude !== 0;

      if (!hasUserLocation) {
            return (
                  <div className="w-full h-125 flex items-center justify-center">
                        Loading map...
                  </div>
            );
      }

      // ✅ Memoize icons
      const userIcon = useMemo(
            () =>
                  L.icon({
                        iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
                        iconSize: [45, 45],
                  }),
            []
      );

      const deliveryBoyIcon = useMemo(
            () =>
                  L.icon({
                        iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
                        iconSize: [45, 45],
                  }),
            []
      );

      const center = [userLocation.latitude, userLocation.longitude];

      const linePositions = deliveryBoyLocation && userLocation ? [[userLocation.latitude, userLocation.longitude], [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]] : []


      return (
            <div className='w-full h-125 rounded-xl overflow-hidden shadow relative z-2'>
                  <MapContainer center={center as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                        <Recenter positions={center as any} />
                        <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                              <Popup>Delivery Address</Popup>
                        </Marker>

                        {deliveryBoyLocation.latitude !== 0 && (
                              <Marker
                                    position={[
                                          deliveryBoyLocation.latitude,
                                          deliveryBoyLocation.longitude,
                                    ]}
                                    icon={deliveryBoyIcon}
                              >
                                    <Popup>Delivery Boy</Popup>
                              </Marker>
                        )}

                        {linePositions.length > 0 && (
                              <Polyline positions={linePositions as any} color="green" />
                        )}
                  </MapContainer>
            </div>
      );
};

export default LiveMap;