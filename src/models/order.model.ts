import mongoose from "mongoose";

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
      status: "pending" | "out of delivery" | "delivered";
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
      status: {
            type: String,
            enum: ["pending", "out of delivery", "delivered"],
            default: "pending"
      }
}, {
      timestamps: true,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
