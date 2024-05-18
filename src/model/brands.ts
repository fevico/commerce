import { Schema, model } from "mongoose";

interface BrandsDocument{
    name: string;
    image: string;
}

const brandSchema = new Schema<BrandsDocument>({
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
    }
}, {timestamps: true})

const BrandModel = model("Brand", brandSchema)
export default BrandModel; 