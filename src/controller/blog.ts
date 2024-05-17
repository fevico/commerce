import BlogModel from "#/model/blog";
import { RequestHandler } from "express";

export const create: RequestHandler = async (req, res) => {
  const { title, description, image } = req.body;
  const blog = await BlogModel.create({ title, description, image });
  res.json({ message: "Record added successfully!", blog });
};

export const getAllBlogs: RequestHandler = async (req, res) =>{
    const blogs = await BlogModel.find()
    if(!blogs) return res.status(400).json({message: "No blogs found"})
        return res.json({blogs});
}

export const getBlogById: RequestHandler = async (req, res) => {
    const {id} = req.params;
    const blog = await BlogModel.findById(id);
    if(!blog) return res.status(400).json({message: "No blog found"})
        return res.json({blog})
}

export const updateBlog: RequestHandler = async (req, res) => {
    const {id} = req.params;
    const {title, description, image} = req.body;
    const blog = await BlogModel.findByIdAndUpdate(id, {title, description, image})
    if(!blog) return res.status(400).json({message: "No blog found"})
        return res.json({message: "Record updated successfully!", blog})
}

export const deleteBlog: RequestHandler = async (req, res) => {
    const {id} = req.params;
    const blog = await BlogModel.findByIdAndDelete(id)
    if(!blog) return res.status(400).json({message: "No blog found"})
        return res.json({message: "Record deleted successfully!"})
}