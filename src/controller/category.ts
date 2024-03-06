import Category from "#/model/category";
import { RequestHandler } from "express";

export const createCategory: RequestHandler = async (req, res) =>{
    const {name, image} = req.body;
    const category = new Category({name, image});
    await category.save();
    res.json({category}); 
}

export const getCategories: RequestHandler = async(req, res)=>{
    const category = await Category.find();
    res.json({category});
}

export const getCategory: RequestHandler = async(req, res)=>{
    const {catId} = req.params;
    const category = await Category.findById(catId);
    if(!category) return res.status(400).json({message: "Something went wrong!"});
    res.json({category});
}

export const updateCategory: RequestHandler = async(req, res)=>{
    const {catId} = req.params;
    const {name, image} = req.body;
    const category = await Category.findByIdAndUpdate(catId, {name, image}, {new: true});
    if(!category) return res.status(400).json({message: "Category not found!"});
    res.json({category});
}

export const deleteCategory: RequestHandler = async(req, res)=>{ 
    const {catId} = req.params;
    const category = await Category.findByIdAndDelete(catId);
    if(!category) return res.status(400).json({message: "Something went wrong!"})
    res.json({message: true});
}  