"use client";

import { ILocation } from "@/components/DeliveryBoyDashboard";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import { IOrder } from "@/models/order.model";
import { useAppSelector } from "@/redux/hook";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      const [newMessage, setNewMessage] = useState("");
      const [messages, setMessages] = useState<IMessage[]>([]);
      const chatBoxRef = useRef<HTMLDivElement>(null);
      const router = useRouter();
      const socket = getSocket();

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

      useEffect((): any => {
            if (orderId) {
                  socket.emit("join-room", orderId)

                  socket.on("send-message", (message) => {
                        if (message.roomId === orderId) {
                              setMessages(prev => [...prev, message]);
                        }
                  });
            }


            return () => {
                  socket.off("join-room");
                  socket.off("send-message");
            }
      }, []);

      useEffect(() => {
            const getAllMessages = async () => {
                  try {
                        const result = await axios.post("/api/chat/messages", { roomId: orderId });
                        console.log(result.data);

                        setMessages(result.data);
                  } catch (error) {
                        console.log(error);
                  }
            }

            getAllMessages();
      }, []);

      useEffect(() => {
            chatBoxRef.current?.scrollTo({
                  top: chatBoxRef.current.scrollHeight,
                  behavior: "smooth",
            })
      }, [messages]);

      const sendMsg = () => {
            const message = {
                  roomId: orderId,
                  text: newMessage,
                  senderId: userData?._id,
                  time: new Date().toLocaleTimeString([],
                        { hour: "2-digit", minute: "2-digit" }
                  )
            }
            socket.emit("send-message", message);

            setNewMessage("");
      }

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

                        <div className="px-4 mt-6 space-y-4">
                              <div className="rounded-3xl overflow-hidden border shadow">
                                    <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
                              </div>

                              <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-2 space-y-3" ref={chatBoxRef}>
                                          <AnimatePresence>
                                                {
                                                      messages.map((msg, index) => (
                                                            <motion.div
                                                                  key={msg._id?.toString()}
                                                                  initial={{ opacity: 0, y: 15 }}
                                                                  animate={{ opacity: 1, y: 0 }}
                                                                  exit={{ opacity: 0 }}
                                                                  transition={{ duration: 0.2 }}
                                                                  className={`flex ${msg.senderId === userData?._id ? "justify-end" : "justify-start"}`}
                                                            >
                                                                  <div className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${msg.senderId === userData?._id ? "bg-green-600 text-white rounded-br-none"
                                                                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                                                                        }`}>
                                                                        <p>{msg.text}</p>
                                                                        <p className="text-[10px] opacity-70 mt-1 text-right">{msg.time}</p>
                                                                  </div>

                                                            </motion.div>
                                                      ))
                                                }
                                          </AnimatePresence>
                                    </div>
                                    <div className="flex gap-2 mt-3 border-t pt-3">
                                          <input
                                                type="text"
                                                placeholder="Type a Message..."
                                                className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-xl outline-none focus:ring-2 focus:ring-green-500"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                          />
                                          <button
                                                className="bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white"
                                                onClick={sendMsg}
                                          >
                                                <Send size={18} />
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default TrackOrder;