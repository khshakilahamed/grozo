
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { ILocation } from './DeliveryBoyDashboard';
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface ILiveMapProps {
      userLocation: ILocation,
      deliveryBoyLocation: ILocation
}

const LiveMap = ({ userLocation, deliveryBoyLocation }: ILiveMapProps) => {
      const deliveryBoyIcon = L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
            iconSize: [45, 45],
      });

      const userIcon = L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
            iconSize: [45, 45],
      });

      const center = [userLocation.latitude, userLocation.longitude];

      const linePositions = deliveryBoyLocation && userLocation ? [[userLocation.latitude, userLocation.longitude], [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]] : []


      return (
            <div className='w-full h-125 rounded-xl overflow-hidden shadow relative'>
                  <MapContainer center={center as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                        <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                              <Popup>Delivery Address</Popup>
                        </Marker>

                        {
                              deliveryBoyLocation && <Marker position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} icon={deliveryBoyIcon}></Marker>
                        }
                        <Polyline positions={linePositions as any} color='green'/>

                  </MapContainer>
            </div>
      );
};

export default LiveMap;