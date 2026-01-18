import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
      try {
            await connectDb();

            //TODO: need to check the user exist or not [take userId from session, not frontend]
            const { userId, items, paymentMethod, totalAmount, deliveryFee, address } = await req.json();
            //TODO: deliveryFee - calculate in backend
            //TODO: totalAmount - calculate in backend

            if (!items || !userId || !paymentMethod || !totalAmount || !address) {
                  return NextResponse.json(
                        { message: "Please send all credentials." },
                        { status: 400 }
                  )
            }
            const user = await User.findById(userId);

            if (!user) {
                  return NextResponse.json(
                        { message: "user not found" },
                        { status: 400 }
                  )
            }

            // if (paymentMethod === "cod") {
            const newOrder = await Order.create({
                  user: userId,
                  items,
                  paymentMethod,
                  deliveryFee,
                  totalAmount,
                  address,
            });

            return NextResponse.json(
                  newOrder,
                  { status: 200 }
            )
            // }

      } catch (error) {
            return NextResponse.json(
                  { message: `Failed to place order: ${error}` },
                  { status: 500 }
            )
      }
}