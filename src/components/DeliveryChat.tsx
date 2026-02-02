"use client";
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { Loader2, Send, Sparkle } from "lucide-react";
import mongoose from "mongoose";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type props = {
      orderId: mongoose.Types.ObjectId;
      deliveryBoyId: mongoose.Types.ObjectId;
}
const DeliveryChat = ({ orderId, deliveryBoyId }: props) => {
      const [newMessage, setNewMessage] = useState("");
      const [messages, setMessages] = useState<IMessage[]>([]);
      const socket = getSocket();
      const chatBoxRef = useRef<HTMLDivElement>(null);
      const [suggestions, setSuggestions] = useState([]);
      const [loading, setLoading] = useState(false);

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
                  senderId: deliveryBoyId,
                  time: new Date().toLocaleTimeString([],
                        { hour: "2-digit", minute: "2-digit" }
                  )
            }
            socket.emit("send-message", message);

            setNewMessage("");
      }

      const getSuggestions = async () => {
            setLoading(true)
            try {
                  const lastMessage = messages?.filter(m => m.senderId !== deliveryBoyId)?.at(-1);
                  const result = await axios.post("/api/chat/ai-suggestions", {
                        message: lastMessage?.text,
                        role: "delivery_boy",

                  });

                  console.log(result.data);
                  setSuggestions(result?.data);
            } catch (error) {
                  console.log(error);
            } finally {
                  setLoading(false)
            }
      }


      return (
            <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                        <span>Quick Replies</span>
                        <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
                              onClick={getSuggestions}
                              disabled={loading}
                        >
                              <Sparkle size={14} />{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "AI suggest"}
                        </motion.button>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                        {
                              suggestions.map((s, index) => (
                                    <motion.div
                                          key={s}
                                          whileTap={{ scale: 0.92 }}
                                          className="px-3 py-1 text-xs bg-green-50 border-green-200 text-green-700 rounded-full cursor-pointer"
                                          onClick={() => setNewMessage(s)}
                                    >
                                          {s}
                                    </motion.div>
                              ))
                        }
                  </div>
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
                                                className={`flex ${msg.senderId === deliveryBoyId ? "justify-end" : "justify-start"}`}
                                          >
                                                <div className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${msg.senderId === deliveryBoyId ? "bg-green-600 text-white rounded-br-none"
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
      );
};

export default DeliveryChat;