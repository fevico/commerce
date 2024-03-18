import { RequestHandler } from "express";
import Product from "#/model/product";
import User from "#/model/user";

export const getAllproduct: RequestHandler = async(req, res)=>{
    const products = await Product.find();
    if(!products) return res.status(400).json({message: "Something went wrong!"});
    res.json({products});
}

export const getProductById: RequestHandler = async(req, res)=>{
    const {productId} = req.params;
    const product = await Product.findById(productId)
     if(!product) return res.status(400).json({message: "Something went wrong!"});
    res.json({product});
}

export const createProduct: RequestHandler = async (req, res) =>{
    // const user = req.user.id;
    // const findUser =await User.findById(user)
    // if(!findUser) return res.status(400).json({error: "Cannot create product"});
    const {name, description, price, image, categoryId, quantity} = req.body;
    const product = new Product({name, description, price, image, categoryId, quantity});
    await product.save();
    res.json({product});
}

export const updateProduct: RequestHandler = async (req, res) =>{
    const {productId} = req.params;
    const {name, description, price, image, categoryId, quantity} = req.body;
    const product = await Product.findByIdAndUpdate(productId, req.body, {new: true});
    if(!product) return res.status(400).json({message: "product not found!"});
    res.json({product});
}

export const deleteproduct: RequestHandler = async (req, res) =>{
    const {productId} = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if(!product) return res.status(400).json({message: "Something went wrong!"});
    res.json({message: true});
}