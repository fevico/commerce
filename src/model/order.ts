import { Model, model, Schema, ObjectId } from "mongoose";

interface orderDocument {
    _id: ObjectId;
    userId: ObjectId;
    products: [{productId: ObjectId, quantity: number}];
    address: string;
    phone: number;
}

const orderSchema = new Schema<orderDocument>({
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    products:{
        type: [{productId: Schema.Types.ObjectId, 
        quantity: Number}]
    },
    address:{
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }
}, {timestamps: true})

export default model("Order", orderSchema) as Model<orderDocument>;