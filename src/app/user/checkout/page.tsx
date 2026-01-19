"use client";
import { useAppSelector } from "@/redux/hook";
import { ArrowLeft, Building, CreditCard, CreditCardIcon, Home, Loader2, LocateFixed, MapPin, Navigation, Phone, Search, Truck, User } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const markerIcon = new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
})

const CheckoutPage = () => {
      const router = useRouter();
      const { userData } = useAppSelector((state) => state.user);
      const { cartData, subTotal, deliveryFee, finalTotal } = useAppSelector((state) => state.cart);
      const [address, setAddress] = useState({
            fullName: "",
            mobile: "",
            city: "",
            state: "",
            postCode: "",
            fullAddress: "",
      });
      const [position, setPosition] = useState<[number, number] | null>(null) // latitude, longitude
      const [searchQuery, setSearchQuery] = useState("");
      const [searchLoading, setSearchLoading] = useState(false);
      const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

      const setCurrentGeoPosition = () => {
            if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                        (pos) => {
                              const { latitude, longitude } = pos.coords;
                              setPosition([latitude, longitude]);
                        },
                        (err) => console.log("location error: ", err),
                        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
                  )
            }
      }

      useEffect(() => {
            setCurrentGeoPosition()
      }, []);

      const DraggableMarker: React.FC = () => {
            const map = useMap();

            useEffect(() => {
                  map.setView(position as LatLngExpression, 15, { animate: true });
            }, []);

            return <Marker
                  icon={markerIcon}
                  position={position as LatLngExpression}
                  draggable={true}
                  eventHandlers={{
                        dragend: (e: L.LeafletEvent) => {
                              const marker = e.target as L.Marker;
                              const { lat, lng } = marker.getLatLng();
                              setPosition([lat, lng]);
                        }
                  }}
            ></Marker>
      }

      useEffect(() => {
            if (userData) {
                  setAddress((prev) => ({
                        ...prev,
                        fullName: userData.name || "",
                        mobile: userData.mobile || "",
                  }))
            }
      }, [userData]);

      useEffect(() => {
            const fetchAddress = async () => {
                  if (!position) return;
                  try {
                        const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`);

                        console.log(result.data);

                        setAddress((prev) => ({
                              ...prev,
                              city: result?.data.address?.state_district || "",
                              state: result?.data?.address?.state || "",
                              postCode: result?.data?.address?.postcode || "",
                              fullAddress: result?.data?.display_name || "",
                        }))
                  } catch (error) {
                        console.log(error)
                  }
            }

            fetchAddress();
      }, [position]);

      const handleSearchQuery = async () => {
            if (!searchQuery) return;
            setSearchLoading(true);

            const provider = new OpenStreetMapProvider();
            const results = await provider.search({ query: searchQuery });

            const bdResults = results?.filter(result => result.label.toLocaleLowerCase().includes("bangladesh"));

            if (bdResults) {
                  setPosition([bdResults[0].y, bdResults[0].x])
            }
            setSearchLoading(false);
      }

      const handleCurrentLocation = () => {
            setCurrentGeoPosition();
            setSearchQuery("");
      }

      // TODO: need to form validate
      const handleCodPayment = async () => {
            if (!position) {
                  return null;
            }
            try {
                  const result = await axios.post("/api/user/order", {
                        userId: userData?._id,
                        items: cartData.map(item => ({
                              grocery: item._id,
                              name: item.name,
                              price: item.price,
                              unit: item.unit,
                              quantity: item.quantity,
                              image: item.image,
                        })),
                        totalAmount: finalTotal,
                        deliveryFee: deliveryFee,
                        address: {
                              fullName: address.fullAddress,
                              mobile: address.mobile,
                              city: address.city,
                              state: address.state,
                              fullAddress: address.fullAddress,
                              postCode: address.postCode,
                              latitude: position[0],
                              longitude: position[1]
                        },
                        paymentMethod: paymentMethod,
                  });

                  router.push("/user/order-success")
            } catch (error) {
                  console.log(error);
            }
      }

      const handleOnlinePayment = async () => {
            console.log("clicked online payment")
            if (!position) {
                  return null;
            }

            try {
                  const result = await axios.post("/api/user/payment", {
                        userId: userData?._id,
                        items: cartData.map(item => ({
                              grocery: item._id,
                              name: item.name,
                              price: item.price,
                              unit: item.unit,
                              quantity: item.quantity,
                              image: item.image,
                        })),
                        totalAmount: finalTotal,
                        deliveryFee: deliveryFee,
                        address: {
                              fullName: address.fullAddress,
                              mobile: address.mobile,
                              city: address.city,
                              state: address.state,
                              fullAddress: address.fullAddress,
                              postCode: address.postCode,
                              latitude: position[0],
                              longitude: position[1]
                        },
                        paymentMethod: paymentMethod,
                  })

                  window.location.href = result.data.url;

            } catch (error) {
                  console.log("online payment error: ", error);
            }
      }

      return (
            <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
                  <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
                        onClick={() => router.push("/user/cart")}
                  >
                        <ArrowLeft size={16} />
                        <span>Back to cart</span>
                  </motion.button>

                  <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
                  >Checkout</motion.h1>

                  <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-gray-100"
                        >
                              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin className="text-green-700" /> Delivery Address
                              </h2>

                              {/* Address */}
                              <div className="space-y-4">
                                    <div className="relative">
                                          <User className="absolute left-3 top-3 text-green-600" size={18} />
                                          <input
                                                type="text"
                                                placeholder="Full name"
                                                value={address.fullName}
                                                onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                                                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                          />
                                    </div>
                                    <div className="relative">
                                          <Phone className="absolute left-3 top-3 text-green-600" size={18} />
                                          <input
                                                type="text"
                                                placeholder="Full name"
                                                value={address.mobile}
                                                onChange={(e) => setAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                                                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                          />
                                    </div>
                                    <div className="relative">
                                          <Home className="absolute left-3 top-3 text-green-600" size={18} />
                                          <input
                                                type="text"
                                                placeholder="Full address"
                                                value={address.fullAddress}
                                                onChange={(e) => setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))}
                                                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                          />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                          <div className="relative">
                                                <Building className="absolute left-3 top-3 text-green-600" size={18} />
                                                <input
                                                      type="text"
                                                      placeholder="City"
                                                      value={address.city}
                                                      onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                                                      className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                                />
                                          </div>
                                          <div className="relative">
                                                <Navigation className="absolute left-3 top-3 text-green-600" size={18} />
                                                <input
                                                      type="text"
                                                      placeholder="State"
                                                      value={address.state}
                                                      onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                                                      className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                                />
                                          </div>
                                          <div className="relative">
                                                <Search className="absolute left-3 top-3 text-green-600" size={18} />
                                                <input
                                                      type="text"
                                                      placeholder="Post code"
                                                      value={address.postCode}
                                                      onChange={(e) => setAddress((prev) => ({ ...prev, postCode: e.target.value }))}
                                                      className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                                                />
                                          </div>
                                    </div>
                                    {/* Search */}
                                    <div className="flex gap-2 mt-3">
                                          <input
                                                type="text"
                                                placeholder="search city or area..."
                                                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                          />
                                          <button
                                                className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium" onClick={handleSearchQuery}
                                                disabled={searchLoading}
                                          >
                                                {
                                                      searchLoading ? <Loader2 size={16} className="animate-spine" /> : "Search"
                                                }
                                          </button>
                                    </div>
                                    {/* Map */}
                                    <div className="relative mt-6 h-82.5 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                          {
                                                position && <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
                                                      <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                      />
                                                      <DraggableMarker />
                                                </MapContainer>
                                          }

                                          <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999"
                                                onClick={handleCurrentLocation}
                                          >
                                                <LocateFixed size={22} />
                                          </motion.button>
                                    </div>
                              </div>
                        </motion.div>
                        <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
                        >
                              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"> <CreditCard className="text-green-600" /> Payment Method</h2>

                              {/* Payment Options */}
                              <div className="space-y-4 mb-6">
                                    <button
                                          className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "online" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"}`}
                                          onClick={() => setPaymentMethod("online")}
                                    >
                                          <CreditCardIcon className="text-green-600" />
                                          <span className="font-medium text-gray-700">Pay Online (stripe)</span>
                                    </button>
                                    <button
                                          className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "cod" ? "border-green-600 bg-green-50 shadow-sm" : "hover:bg-gray-50"}`}
                                          onClick={() => setPaymentMethod("cod")}
                                    >
                                          <Truck className="text-green-600" />
                                          <span className="font-medium text-gray-700">Cash on Delivery</span>
                                    </button>

                              </div>

                              <div className="font-semibold border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
                                    <div className="flex justify-between">
                                          <span>Subtotal</span>
                                          <span className="text-green-600">৳{subTotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                          <span>Delivery Fee</span>
                                          <span className="text-green-600">৳{deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between font-bold  text-lg border-t pt-3">
                                          <span>Final Total</span>
                                          <span className="text-green-600">৳{finalTotal}</span>
                                    </div>
                              </div>

                              {/* place order button */}
                              <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold"
                                    onClick={() => {
                                          if (paymentMethod === "cod") {
                                                handleCodPayment()
                                          }
                                          else {
                                                handleOnlinePayment()
                                          }
                                    }}
                              >
                                    {
                                          paymentMethod === "cod" ? "Place Order" : "Pay & Place order"
                                    }
                              </motion.button>
                        </motion.div>
                  </div>
            </div>
      );
};

export default CheckoutPage;