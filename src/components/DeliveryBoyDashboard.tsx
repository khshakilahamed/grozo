"use client";

import { getSocket } from "@/lib/socket";
import { IDeliveryAssignment } from "@/models/deliveryAssignment.model";
import { IOrder } from "@/models/order.model";
import axios from "axios";
import { useEffect, useState } from "react";

const DeliveryBoyDashboard = () => {
      const [assignments, setAssignments] = useState<IDeliveryAssignment[]>([]);

      useEffect(() => {
            const fetchAssignments = async () => {
                  try {
                        const result = await axios.get("/api/delivery/get-assignments");
                        
                        setAssignments(result.data);
                  } catch (error) {
                        console.log(error);
                  }
            }

            fetchAssignments();
      }, []);

      useEffect(():any =>{
            const socket = getSocket();

            socket.on("new-assignment", ({deliveryAssignment}) => {
                  setAssignments((prev) => [...prev, deliveryAssignment]);
            });

            return ()=> socket.off("new-assignment")
      }, []);

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
                                                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg">Accept</button>
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