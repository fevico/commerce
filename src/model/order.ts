import { Model, model, ObjectId, Schema } from "mongoose";

export interface OrderDocument {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  referenceId: string;
  email: string;
  transactionId: string;
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
  address: String;
  mobile: string;
  orderStatus: "pending" | "processing" | "confirmed";
}

const orderSchema = new Schema<OrderDocument>({
  // _id:{
  //   type: Schema.Types.ObjectId
  // },
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
  referenceId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  transactionId: {
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
        required: true,
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
  orderStatus: {
    type: String,
    default: "pending",
  },
}, {timestamps: true});
export default model("Order", orderSchema) as Model<OrderDocument>;
