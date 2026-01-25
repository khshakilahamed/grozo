import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order, { IOrder } from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
      try {
            await connectDb();
            const { orderId } = await params;
            const { status } = await req.json();
            const order = await Order.findById(orderId).populate("user");
            if (!order) {
                  return NextResponse.json(
                        { message: "order not found." },
                        { status: 400 }
                  )
            }

            order.status = status;
            let deliveryBoysPayload: any = [];
            let candidates: any = [];
            let deliveryAssignment;

            if (status === "out of delivery" && !order.assignment) {
                  const { latitude, longitude } = order.address;

                  const nearByDeliveryBoys = await User.find({
                        role: "deliveryBoy",
                        location: {
                              $near: {
                                    $geometry: {
                                          type: "Point",
                                          coordinates: [Number(longitude), Number(latitude)]
                                    },
                                    $maxDistance: 10000 // 10KM -> 10 * 1000
                              }
                        }
                  });

                  const nearByIds = nearByDeliveryBoys.map((b) => b._id);

                  const busyIds = await DeliveryAssignment.find({
                        assignedTo: {
                              $in: nearByIds
                        },
                        status: { $nin: ["broadcasted", "completed"] }
                  }).distinct("assignedTo"); // need to assigned user to remove from broadcast

                  const busyIdSet = new Set(busyIds.map(b => String(b)));
                  const availableDeliveryBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

                  candidates = availableDeliveryBoys.map(b => b._id);

                  if (candidates.length === 0) {
                        await order.save();

                        await emitEventHandler("order-status-update", {
                              orderId: order?._id,
                              status: order.status
                        });

                        return NextResponse.json(
                              { message: "there is no available delivery boys." },
                              { status: 200 }
                        )
                  }

                  deliveryAssignment = await DeliveryAssignment.create({
                        order: order._id,
                        broadcastedTo: candidates,
                        status: "broadcasted"
                  });

                  order.assignment = deliveryAssignment._id;

                  deliveryBoysPayload = availableDeliveryBoys.map(b => ({
                        id: b._id,
                        name: b.name,
                        mobile: b.mobile,
                        longitude: b.location.coordinates[0],
                        latitude: b.location.coordinates[1],
                  }));

                  await deliveryAssignment.populate("order");
            }

            await order.save();
            await order.populate("user");

            NextResponse.json(
                  {
                        assignment: order.assignment?._id,
                        availableBoys: deliveryBoysPayload
                  },
                  { status: 200 }
            );

            await emitEventHandler("order-status-update", {
                  orderId: order?._id,
                  status: order.status
            });

            for (const boyId of candidates) {
                  const boy = await User.findById(boyId);
                  if (boy.socketId) {
                        await emitEventHandler("new-assignment", {
                              deliveryAssignment,
                              socketId: boy.socketId,
                        });
                  }
            }

            return;


      } catch (error) {
            return NextResponse.json(
                  { message: `update status error: ${error}` },
                  { status: 200 }
            )
      }
}