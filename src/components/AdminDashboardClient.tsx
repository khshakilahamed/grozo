"use client";
import { DollarSign, Package, Truck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type PropType = {
      earning: {
            today: number;
            sevenDays: number;
            total: number;
      },
      stats: {
            title: string;
            value: number;
      }[]
}

const AdminDashboardClient = ({ earning, stats }: PropType) => {
      const [filter, setFilter] = useState<"today" | "sevenDays" | "total">();

      const currentEarning = filter === "today" ? earning.today : filter === "sevenDays" ? earning.sevenDays : earning.total;

      const title = filter === "today" ? "Today's Earning" : filter === "sevenDays" ? "Last 7 Days Earning" : "Total Earning";

      return (
            <div className='pt-28 w-[90%] md:w-[80%] mx-auto'>
                  <div className='flex flex-col md:flex-row sm:items-center sm:justify-between gap-4 mb-10 text-center sm:text-left'>
                        <motion.h1
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="text-3xl md:text-4xl font-bold text-green-700"
                        >🏪 Admin Dashboard</motion.h1>

                        <select
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition w-full sm:w-auto"
                              onChange={(e) => setFilter(e.target.value as any)}
                              value={filter}
                        >
                              <option value="total">Total</option>
                              <option value="sevenDays">Last 7 Days</option>
                              <option value="today">Today</option>
                        </select>
                  </div>

                  <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-green-50 border border-green-200 shadow-sm rounded-2xl p-6 text-center mb-10"
                  >
                        <h2 className="text-lg font-semibold text-green-700 mb-2">{title}</h2>
                        <p className="text-4xl font-extrabold text-green-800">৳{currentEarning.toLocaleString()}</p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats?.map((s, i) => {
                              const icons = [
                                    <Package key="p" className="text-green-700 w-6 h-6" />,
                                    <Users key="u" className="text-green-700 w-6 h-6" />,
                                    <Truck key="t" className="text-green-700 w-6 h-6" />,
                                    <DollarSign key="r" className="text-green-700 w-6 h-6" />,
                              ];

                              return <motion.div></motion.div>
                        })}
                  </div>
            </div>
      );
};

export default AdminDashboardClient;