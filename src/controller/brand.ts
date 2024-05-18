import BrandModel from "#/model/brands";
import { RequestHandler } from "express";

export const create: RequestHandler = async(req, res) =>{
    const {name, image} = req.body
    const brand = await BrandModel.create({name, image});
    res.json(brand);
}

export const getAllBrand: RequestHandler = async(req, res) =>{
    const brands = await BrandModel.find();
    if(!brands) return res.status(404).json({message: "Brands not found"});
    res.json(brands);
}

export const getBrandById: RequestHandler = async(req, res) =>{
    const {id} = req.params
    const brand = await BrandModel.findById(id);
    if(!brand) return res.status(404).json({message: "Brand not found"});
    res.json(brand);
}

export const updateBrandById: RequestHandler = async(req, res) =>{
    const {id} = req.params
    const brand = await BrandModel.findByIdAndUpdate(id, req.body, {new: true})
    if(!brand) return res.status(404).json({message: "Brand not found"});
    res.json(brand);
}

export const deleteBrandById: RequestHandler = async (req, res) =>{
    const {id} = req.params
    const brand = await BrandModel.findByIdAndDelete(id);
    if(!brand) return res.status(422).json({message: "No record found!"})
        res.json({message: "Brand deleted suceesully!"})
}
