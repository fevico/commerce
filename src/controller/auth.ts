import User from "#/model/user";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/variables";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import passwordResetToken from "#/model/passwordResetToken";
import crypto from "crypto";
import { sendForgetPasswordLink, sendPassResetSuccessEmail } from "#/utils/mail";


export const createUser: RequestHandler = async (req, res)=>{
    const {email, name, password, } = req.body;
    const oldUser = await User.findOne({email});
    if(oldUser) return res.status(400).json({message: "User email already exist!"});
    const user = await User.create({name, email, password});
    res.json({user: {id: user.id, email: user.email, name: user.name}}); 
}

export const signIn: RequestHandler = async (req, res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(403).json({message: "Email/Password Mismatch!"});
    // compare password 
    const matched = await user.comparePassword(password)
    if(!matched) return res.status(403).json({message: "Email/Password Mismatch!"});
    const token = jwt.sign({userId: user._id}, JWT_SECRET);
    user.token = (token);
    await user.save();
    res.json({
        profile:{
            id: user._id,
            name: user.name,
            email: user.email,
        }
    });
}

export const generateForgetPasswordLink: RequestHandler = async(req, res)=>{
   
    const { email } = req.body;

   const user = await User.findOne({email})
   if(!user) return res.status(404).json({error: "Account not found!"})

  //  generate the link if the email exist 
  await passwordResetToken.findOneAndDelete({
    user: user._id,
  })

const token = crypto.randomBytes(36).toString('hex')

  await passwordResetToken.create({
    user: user._id,
    token,
  })

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}` 

  sendForgetPasswordLink({ email:user.email, link:resetLink });

  res.json({ message: "Check your registered mail" }); 
}


export const isValidPasswordReset: RequestHandler = async(req, res)=>{
    const { token, userId } = req.body;

   const resetToken = await passwordResetToken.findOne({user: userId})
   if(!resetToken) return res.status(403).json({error: "Unauthorized acccess, invalid token"});

   const matched = await resetToken.compareToken(token)
   if(!matched) return res.status(403).json({error: "Unauthorized acccess, invalid token"});
  
   res.json({ message: "your token is valid."})
}

export const updatePassword: RequestHandler = async(req, res)=>{
    const {password, userId} = req.body
    const user = await User.findById(userId)
    if(!user) return res.status(403).json({error: "Unathorized access!"}) 
  
    const matched = await user.comparePassword(password)
    if(matched) return res.status(422).json({error: "The new password must be diffrent!"});
  
    user.password = password
    await user.save() 
  
    await passwordResetToken.findOneAndDelete({user: user._id});
    // send success mail
    sendPassResetSuccessEmail(user?.name, user.email) 
    res.json({message: "Password Reset successfully."})
}