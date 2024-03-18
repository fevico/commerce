// @ts-nocheck
import passwordResetToken from "#/model/passwordResetToken";
import User from "#/model/user";
import { JWT_SECRET } from "#/utils/variables";
import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import jwt from 'jsonwebtoken'


export const isValidPasswordResetToken: RequestHandler = async(req, res, next)=>{
   
    const { token, userId } = req.body;

   const resetToken = await passwordResetToken.findOne({user: userId})
   if(!resetToken) return res.status(403).json({error: "Unauthorized acccess, invalid token"});

   const matched = await resetToken.compareToken(token)
   if(!matched) return res.status(403).json({error: "Unauthorized acccess, invalid token"});
    
   next()
}

export const mustAuth: RequestHandler = async(req, res, next)=>{
    const {authorization} = req.headers;

    const token = authorization?.split("Bearer ")[1];
    if(!token) return res.status(403).json({error: "Unauthorized request"});


    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const id = payload.userId;
    const user = await User.findOne({_id: id, token: token});
    if(!user) return res.status(403).json({error: "Unauthoried request! "});
     
    req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },     
      
      req.token = token;

    next()
};

export const isAdmin: RequestHandler = async (req, res, next) =>{
    const {authorization} = req.headers;
    const token = authorization?.split("Bearer ")[1];
    if(!token) return res.status(403).json({error: "Unauthorized request"});
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const role = payload.role;
    if(role !== "admin"){
        return res.status(403).json({error: "Unauthorized request!"})
    }
    req.user = {
        id: payload.userId,
        role: role
    }

    next() 

}
