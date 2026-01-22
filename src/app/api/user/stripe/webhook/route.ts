import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
      const signature = req.headers.get("stripe-signature");
      const rawBody = await req.text();
      let event;

      // console.log("rawBody: ", rawBody);

      try {
            event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (error) {
            console.error("signature verification failed: ", error);
      }

      // console.log("event?.type: ", event?.type);

      if (event?.type === "checkout.session.completed") {
            const session = event.data.object;
            await connectDb();
            await Order.findByIdAndUpdate(session?.metadata?.orderId, { isPaid: true });
      }

      return NextResponse.json(
            { received: true },
            { status: 200 }
      )
}