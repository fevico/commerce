import { Model, model, ObjectId, Schema } from "mongoose";

export interface OrderDocument {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  email: string;
  currency: string;
  cart: [
    {
      id: ObjectId;
      name: string;
      price: number;
      category: string;
      image: string;
      quantity: number;
    }
  ];
  total: number;
  address: string;
  mobile: string;
  proofOfPayment: string;
  orderStatus: "pending" | "shipped" | "completed";
  isPaid: boolean;
  orderNumber: string;
  orderDate: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cart: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          required: false,
        },
        image: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    proofOfPayment: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    orderNumber: {
      type: String,
      required: false,
    },
    orderDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default model("Order", orderSchema) as Model<OrderDocument>;
