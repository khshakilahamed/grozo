"use client";
import { getSocket } from '@/lib/socket';
import { IOrder } from '@/models/order.model';
import { IUser } from '@/models/user.model';
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Truck, UserCheck } from 'lucide-react';
import { motion } from "motion/react";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"

const getStatusColor = (status: string) => {
      switch (status) {
            case "pending":
                  return "bg-yellow-100 text-yellow-700 border-yellow-300"
            case "out of delivery":
                  return "bg-green-100 text-blue-700 border-blue-300";
            case "delivered":
                  return "bg-green-100 text-green-700 border-green-300";
            default:
                  return "bg-gray-100 text-gray-700 border-gray-300";;
      }
}

const UserOrderCard = ({ order }: { order: IOrder }) => {
      const [expanded, setExpanded] = useState(false);
      const [status, setStatus] = useState(order.status);
      const router = useRouter()

      useEffect((): any => {
            const socket = getSocket();
            socket.on("order-status-update", (data) => {
                  if (String(data?.orderId) === String(order?._id)) {
                        setStatus(data.status)
                  }
            });

            return () => socket.off("order-status-update")
      }, []);

      return (
            <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className='bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
            >
                  <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white'>
                        {/* Date & id */}
                        <div>
                              <h3 className='text-lg font-semibold text-gray-800'>order <span className='text-green-700 font-bold'>#{order?._id?.toString().slice(-6)}</span></h3>
                              <p>{new Date(order.createdAt!).toLocaleString()}</p>
                        </div>
                        {/* payment & Status*/}
                        <div className='flex flex-wrap items-center gap-2'>
                              {
                                    order.status !== "delivered" && <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${order.isPaid
                                          ? "bg-green-100 text-green-700 border-green-300"
                                          : "bg-red-100 text-red-700 border-red-300"
                                          }`}>
                                          {
                                                order.isPaid ? "Paid" : "Unpaid"
                                          }
                                    </span>
                              }
                              <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(status)}`}>{status}</span>
                        </div>
                  </div>

                  {/* Payment Method & Address*/}
                  <div className='p-5 space-y-4'>
                        {order.paymentMethod === "cod" ? (
                              <div className='flex items-center gap-2 text-gray-700 text-sm'>
                                    <Truck size={16} className='text-green-600' />
                                    <span>Cash on Delivery</span>
                              </div>
                        ) : (
                              <div className='flex items-center gap-2 text-gray-700 text-sm'>
                                    <CreditCard size={16} className='text-green-600' />
                                    <span>Online Payment</span>
                              </div>
                        )}

                        {
                              order.assignedDeliveryBoy && status !== "delivered" && <>
                                    <div className='mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between'>
                                          <div className='flex items-center gap-3 text-sm text-gray-700'>
                                                <UserCheck className='text-blue-600' size={18} />
                                                <div className='font-semibold text-gray-800'>
                                                      <p>Assigned to: <span>{(order.assignedDeliveryBoy as IUser).name}</span></p>
                                                      <p className='text-xs text-gray-600'>📞 {(order.assignedDeliveryBoy as IUser).mobile}</p>
                                                </div>

                                          </div>
                                          <a
                                                className='bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition'
                                                href={`tel:${(order.assignedDeliveryBoy as IUser).mobile}`}
                                          >Call</a>
                                    </div>
                                    <button
                                          className='w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow- hover:bg-green-700 transition'
                                          onClick={() => router.push(`/user/track-order/${order?._id?.toString()}`)}
                                    > <Truck /> Track Your Order</button>
                              </>

                        }

                        <div className='flex items-center gap-2 text-gray-700 text-sm'>
                              <MapPin size={16} className='text-green-600' />
                              <span className='truncate'>{order.address.fullAddress}</span>
                        </div>

                        <div className='border-t border-gray-100 pt-3'>
                              <button
                                    onClick={() => setExpanded((prev) => !prev)}
                                    className='w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition'
                              >
                                    <span className='flex items-center gap-2'>
                                          <Package size={16} className='text-green-600' />
                                          {expanded ? "Hide Order Items" : `View ${order.items?.length} Item(s)`}
                                    </span>
                                    {
                                          expanded ? <ChevronUp size={16} className='text-green-600' /> : <ChevronDown size={16} className='text-green-600' />
                                    }
                              </button>

                              <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                          height: expanded ? "auto" : 0,
                                          opacity: expanded ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className='overflow-hidden'
                              >
                                    <div className='mt-3 space-y-3'>
                                          {
                                                order.items.map((item, index) => (
                                                      <div key={index} className='flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition'>
                                                            <div className='flex items-center gap-3'>
                                                                  <Image src={item.image} alt={item.name} width={48} height={48} className='w-12 h-12 rounded-lg object-cover border border-gray-200' />
                                                                  <div>
                                                                        <p className='text-sm font-medium text-gray-800'>{item.name}</p>
                                                                        <p className='text-xs text-gray-500'>{item.quantity} x {item.unit}</p>
                                                                  </div>
                                                            </div>
                                                            <p>৳{Number(item.price) * item.quantity}</p>
                                                      </div>
                                                ))
                                          }
                                    </div>

                              </motion.div>
                        </div>

                        <div className='border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800'>
                              <div className='flex items-center gap-2 text-gray-700 text-sm'>
                                    <Truck size={16} className='text-green-600' />
                                    <span>Delivery: <span className='text-green-700 font-semibold'>{status}</span></span>
                              </div>
                              <div>
                                    Total: <span className='text-green-700 font-bold'>৳{order.totalAmount}</span>
                              </div>
                        </div>
                  </div>

            </motion.div>
      );
};

export default UserOrderCard;