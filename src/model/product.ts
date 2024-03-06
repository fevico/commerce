import { Model, model, ObjectId, Schema } from "mongoose";

interface ProductDocument{
    _id: ObjectId;
    name: string;
    categoryId: ObjectId;
    image: string;
    price: number;
    quantity: number;
    description: string;
    topSelling: string;
    featured: "yes" | "no";
    specialProduct: "yes" | "no";
    discount: number;
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
    },
    topSelling:{
        type: String,
    },
    featured:{
        type: String,
        default: 'no'
    },
    specialProduct:{
        type: String,
        default: "no"
    },
    discount:{
        type: Number,
        default: 0
    }
}, {timestamps: true});
export default model("Product", productSchema) as Model<ProductDocument>;