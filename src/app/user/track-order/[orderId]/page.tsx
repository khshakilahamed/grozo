"use client";

import { ILocation } from "@/components/DeliveryBoyDashboard";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { IOrder } from "@/models/order.model";
import { useAppSelector } from "@/redux/hook";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TrackOrder = ({ params }: { params: { orderId: string } }) => {
      const { userData } = useAppSelector((state) => state.user);
      const { orderId } = useParams();
      const [order, setOrder] = useState<IOrder>();
      const [userLocation, setUserLocation] = useState<ILocation>({
            latitude: 0,
            longitude: 0
      });
      const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
            latitude: 0,
            longitude: 0
      });
      const router = useRouter();

      useEffect(() => {
            const getOrder = async () => {
                  try {
                        const result = await axios.get(`/api/user/get-order/${orderId}`);

                        if (result.data) {
                              setOrder(result.data);
                              setUserLocation({
                                    latitude: result.data.address.latitude,
                                    longitude: result.data.address.longitude,
                              })
                              setDeliveryBoyLocation({
                                    longitude: result.data.assignedDeliveryBoy.location?.coordinates[0],
                                    latitude: result.data.assignedDeliveryBoy.location?.coordinates[1],
                              })
                        }
                  } catch (error) {
                        console.log(error);
                  }
            }

            getOrder()
      }, [userData?._id]);


      useEffect(() => {
            if (!order) return;

            const socket = getSocket();

            const handler = ({ userId, location }: any) => {
                  if (String(userId) === String(order.assignedDeliveryBoy?._id)) {
                        setDeliveryBoyLocation({
                              longitude: location.coordinates[0],
                              latitude: location.coordinates[1],
                        });
                  }
            };

            socket.on("update-deliveryBoy-location", handler);

            return () => {
                  socket.off("update-deliveryBoy-location", handler);
            };
      }, [order]);

      return (
            <div className="w-full min-h-screen bg-linear-to-b from-green-50 to-white">
                  <div className="max-w-2xl mx-auto pb-24">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999">
                              <button
                                    className="p-2 bg-green-100 rounded-full"
                                    onClick={() => router.back()}
                              >
                                    <ArrowLeft className="text-green-700" size={20} />
                              </button>
                              <div>
                                    <h2>Track Order</h2>
                                    <p className="text-sm text-gray-600">order#{order?._id!.toString().slice(-6)} <span className="text-green-700 font-semibold">{order?.status}</span></p>
                              </div>
                        </div>

                        <div className="px-4 mt-6">
                              <div className="rounded-3xl overflow-hidden border shadow">
                                    <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default TrackOrder;