import { Model, Schema, model, ObjectId } from "mongoose";

interface Shipping{
    _id?: ObjectId;
    name: string;
    email: string;
    address: string;
    phone: string;
    orderId: ObjectId;
    status: "pending" | "shipped" | "delivered";
}

const shippingSchema = new Schema<Shipping>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    address: {type: String, required: true},
    phone: {type: String, required: true},
    orderId: {type: Schema.Types.ObjectId, required: true, ref: "Order"},
    status: {type: String, required: true, default: "pending"}
}, {timestamps: true});

export default model("Shipping", shippingSchema) as Model<Shipping>;