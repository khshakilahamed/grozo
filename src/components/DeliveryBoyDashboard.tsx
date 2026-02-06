"use client";

import { getSocket } from "@/lib/socket";
import { IDeliveryAssignment } from "@/models/deliveryAssignment.model";
import { IOrder } from "@/models/order.model";
import { useAppSelector } from "@/redux/hook";
import axios from "axios";
import { useEffect, useState } from "react";
import LiveMap from "./LiveMap";
import DeliveryChat from "./DeliveryChat";
import { Loader } from "lucide-react";

export interface ILocation {
      latitude: number,
      longitude: number;
}
const DeliveryBoyDashboard = () => {
      const [assignments, setAssignments] = useState<IDeliveryAssignment[]>([]);
      const { userData } = useAppSelector((state) => state.user);
      const [activeOrder, setActiveOrder] = useState<any>(null);
      const [userLocation, setUserLocation] = useState<ILocation>({
            latitude: 0,
            longitude: 0
      });
      const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
            latitude: 0,
            longitude: 0
      });
      const [showOtpBox, setShowOtpBox] = useState(false);
      const [otp, setOtp] = useState("");
      const [otpError, setOtpError] = useState("");
      const [sendOtpLoading, setSendOtpLoading] = useState(false);
      const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
      let socket = getSocket();

      const fetchAssignments = async () => {
            try {
                  const result = await axios.get("/api/delivery/get-assignments");

                  setAssignments(result.data);
            } catch (error) {
                  console.log(error);
            }
      }

      useEffect((): any => {
            socket.on("new-assignment", ({ deliveryAssignment }) => {
                  setAssignments((prev) => [...prev, deliveryAssignment]);
            });

            return () => socket.off("new-assignment")
      }, []);

      useEffect(() => {
            if (!userData?._id) return

            if (!navigator.geolocation) return;

            const watcher = navigator.geolocation.watchPosition((pos) => {
                  const lat = pos.coords.latitude;
                  const lon = pos.coords.longitude;

                  setDeliveryBoyLocation({ latitude: lat, longitude: lon })

                  socket.emit("update-location", {
                        userId: userData?._id,
                        latitude: lat,
                        longitude: lon,
                  })
            }, (error) => {
                  console.log(error)
            }, { enableHighAccuracy: true });

            return () => navigator.geolocation.clearWatch(watcher);
      }, [userData?._id]);


      const fetchCurrentOrder = async () => {
            try {
                  const result = await axios.get("/api/delivery/current-order");

                  console.log(result.data);
                  if (result?.data?.active) {
                        setActiveOrder(result.data.assignment);
                        setUserLocation({
                              latitude: result?.data?.assignment?.order?.address?.latitude,
                              longitude: result?.data?.assignment?.order?.address?.longitude,
                        });
                  }

            } catch (error) {
                  console.log(error);
            }
      }

      useEffect(() => {
            fetchCurrentOrder();
            fetchAssignments();
      }, [userData]);

      useEffect((): any => {
            socket.on("update-deliveryBoy-location", ({ userId, location }) => {
                  setDeliveryBoyLocation({
                        latitude: location?.coordinates[1],
                        longitude: location?.coordinates[0],
                  })
            });

            return () => socket.off("update-deliveryBoy-location")
      }, []);

      const handleAccept = async (id: string) => {
            try {
                  const result = await axios.get(`/api/delivery/assignment/${id}/accept-assignment`)

                  console.log(result.data);
            } catch (error) {
                  console.log(error);
            }
      }

      const sendOtp = async () => {
            setOtpError("");
            setSendOtpLoading(true);
            try {
                  const result = await axios.post("/api/delivery/otp/send", {
                        orderId: activeOrder.order._id,
                  });

                  console.log(result.data);
                  setShowOtpBox(true);
            } catch (error) {
                  console.log(error);
                  setOtpError("Otp send Error.");
            } finally {
                  setSendOtpLoading(false);
            }
      }

      const verifyOtp = async () => {
            setOtpError("");
            setVerifyOtpLoading(true);
            try {
                  const result = await axios.post("/api/delivery/otp/verify", {
                        orderId: activeOrder.order._id, otp
                  });

                  console.log(result.data);
                  setActiveOrder(null);
            } catch (error) {
                  console.log(error);
                  setOtpError("Otp Verification Error.");
            } finally {
                  setVerifyOtpLoading(false);
            }
      }

      if (activeOrder && userLocation) {
            return (<div className="p-4 pt-30 min-h-screen bg-gray-50">
                  <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold text-green-700 mb-2">Active Delivery</h1>
                        <p>order #{activeOrder.order?._id.toString().slice(-6)}</p>

                        <div className="rounded-xl border shadow-lg overflow-hidden mb-6">
                              <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
                        </div>

                        <DeliveryChat
                              orderId={activeOrder.order._id}
                              deliveryBoyId={userData?._id!}
                        />

                        <div className="mt-6 bg-white rounded-xl border shadow p-6">
                              {
                                    !activeOrder.order.deliveryOtpVerification && !showOtpBox && (
                                          <button
                                                onClick={sendOtp}
                                                className="w-full py-4 bg-green-600 text-white rounded-lg"
                                                disabled={sendOtpLoading}
                                          >
                                                {
                                                      sendOtpLoading ? <Loader size={16} className="animate-spin text-white" /> : "Mark as Delivery"
                                                }
                                          </button>
                                    )
                              }
                              {
                                    showOtpBox && <div
                                          className="mt-4"
                                    >
                                          <input
                                                type="text"
                                                className="w-full py-3 border rounded-lg text-center"
                                                placeholder="Enter Otp"
                                                maxLength={4}
                                                onChange={(e) => setOtp(e.target.value)}
                                                value={otp}
                                          />
                                          <button
                                                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg"
                                                onClick={verifyOtp}
                                                disabled={verifyOtpLoading}
                                          >
                                                {
                                                      verifyOtpLoading ? <Loader size={16} className="animate-spin text-white" /> : "Verify OTP"
                                                }
                                          </button>
                                          {otpError && <div className="text-red-600 mt-2">{otpError}</div>}
                                    </div>
                              }
                        </div>
                  </div>
            </div>)
      }

      return (
            <div className="w-full min-h-screen bg-gray-50 p-4">
                  <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mt-30 mb-7.5">Delivery assignment</h2>
                        {
                              assignments.map(a => (
                                    <div
                                          key={String(a?._id)}
                                          className="p-5 bg-white rounded-xl shadow mb-4 border"
                                    >
                                          <p className=""><strong>Order Id </strong>{String(a?.order._id).slice(-6)}</p>
                                          <p className="text-gray-600">{(a.order as IOrder).address.fullAddress}</p>

                                          <div className="flex gap-3 mt-4">
                                                <button
                                                      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                                                      onClick={() => handleAccept(String(a?._id))}
                                                >Accept</button>
                                                <button className="flex-1 bg-red-600 text-white py-2 rounded-lg">Reject</button>
                                          </div>
                                    </div>
                              ))
                        }
                  </div>

            </div>
      );
};

export default DeliveryBoyDashboard;