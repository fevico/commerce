import { Schema, model } from "mongoose";

interface BlogDocument{
    title: string;
    description: string;
    image: string;
    date: Date;
}

const blogSchema = new Schema<BlogDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true })

const BlogModel = model("Blog", blogSchema)
export default BlogModel;