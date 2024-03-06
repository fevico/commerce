import User from "#/model/user";
import { RequestHandler } from "express";

export const createUser: RequestHandler = async (req, res)=>{
    const {email, name, password, } = req.body;
    const oldUser = await User.findOne({email});
    if(oldUser) return res.status(400).json({message: "User email already exist!"});
    const user = await User.create({name, email, password});
    res.json({user: {id: user.id, email: user.email, name: user.name}}); 
}