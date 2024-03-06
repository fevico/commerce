import { Model, model, ObjectId, Schema } from "mongoose";

interface ProductDocument{
    _id: ObjectId;
    name: string;
    categoryId: ObjectId;
    image: string;
    price: number;
    quantity: number;
    description: string;
}

const productSchema = new Schema<ProductDocument>({
    name:{
        type: String,
        required: true,
    },
    categoryId:{
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    quantity:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true
    }
}, {timestamps: true});
export default model("Product", productSchema) as Model<ProductDocument>;