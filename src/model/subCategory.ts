import { Schema, model } from "mongoose";

interface SubCategoryDocument extends Document{
    title: string;
}

const subCategorySchema = new Schema<SubCategoryDocument>({
    title: { type: String, required: true },
    // other fields
}, {timestamps: true})

const subCategoryModel = model("SubCategory", subCategorySchema)
export default subCategoryModel;