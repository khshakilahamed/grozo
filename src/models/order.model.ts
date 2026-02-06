import mongoose from "mongoose";
import { IUser } from "./user.model";

export interface IOrder {
      _id?: mongoose.Types.ObjectId;
      user: mongoose.Types.ObjectId;
      items: [
            {
                  grocery: mongoose.Types.ObjectId;
                  name: string;
                  price: string;
                  unit: string;
                  image: string;
                  quantity: number;
            }
      ];
      isPaid: boolean;
      deliveryFee: number;
      totalAmount: number;
      paymentMethod: "cod" | "online";
      address: {
            fullName: string;
            mobile: string;
            city: string;
            state: string;
            postCode: string;
            fullAddress: string;
            latitude: number;
            longitude: number;
      };
      assignment?: mongoose.Types.ObjectId;
      assignedDeliveryBoy?: mongoose.Types.ObjectId | IUser;
      status: "pending" | "out of delivery" | "delivered";
      deliveryOtp: string | null;
      deliveryOtpVerification: boolean;
      deliveredAt: Date | null;
      createdAt?: Date;
      updatedAt?: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
      user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
      },
      items: [
            {
                  grocery: {
                        type: mongoose.Types.ObjectId,
                        ref: "Grocery",
                        required: true,
                  },
                  name: String,
                  price: String,
                  unit: String,
                  image: String,
                  quantity: Number,
            }
      ],
      isPaid: {
            type: Boolean,
            default: false,
      },
      deliveryFee: {
            type: Number,
            required: true
      },
      totalAmount: {
            type: Number,
            required: true
      },
      paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            default: "cod"
      },
      address: {
            fullName: String,
            mobile: String,
            city: String,
            state: String,
            postCode: String,
            fullAddress: String,
            latitude: Number,
            longitude: Number,
      },
      assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryAssignment",
            default: null,
      },
      assignedDeliveryBoy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
      },
      status: {
            type: String,
            enum: ["pending", "out of delivery", "delivered"],
            default: "pending"
      },
      deliveryOtp: {
            type: String,
            default: null,
      },
      deliveryOtpVerification: {
            type: Boolean,
            default: false,
      },
      deliveredAt: {
            type: Date,
      },
}, {
      timestamps: true,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
