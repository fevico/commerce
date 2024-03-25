import { Model, model, Schema, ObjectId } from "mongoose";

interface orderDocument {
    _id: ObjectId;
    userId: ObjectId;
    productId:  ObjectId;
    quantity: number;
    address: string;
    phone: number;
    status: "confirmed" | "pending" | "cancelled";  
}

const orderSchema = new Schema<orderDocument>({
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    productId:{
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity:{
        type: Number,
    },
    address:{
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }, 
    status:{
        type: String,
        default: "pending"
    }
}, {timestamps: true})

export default model("Order", orderSchema) as Model<orderDocument>;