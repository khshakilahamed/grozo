import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

            const newOrder = await Order.create({
                  user: userId,
                  items,
                  paymentMethod,
                  deliveryFee,
                  totalAmount,
                  address,
            });

            const session = await stripe.checkout.sessions.create({
                  payment_method_types: ["card"],
                  mode: "payment",
                  success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
                  cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
                  line_items: [
                        {
                              price_data: {
                                    currency: 'bdt',
                                    product_data: {
                                          name: 'Grozo Order Payment',
                                    },
                                    unit_amount: totalAmount * 100,
                              },
                              quantity: 1,
                        },
                  ],
                  metadata: { orderId: newOrder._id.toString() }
            });

            return NextResponse.json(
                  { url: session.url },
                  { status: 200 }
            )

      } catch (error) {
            return NextResponse.json(
                  { message: `Order Payment error: ${error}` },
                  { status: 400 }
            )
      }
}