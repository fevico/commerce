// @ts-nocheck
import User from "#/model/user";
import { CLIENT_ID, CLIENT_SECRET, JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/variables";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import passwordResetToken from "#/model/passwordResetToken";
import crypto from "crypto";
import {
  sendForgetPasswordLink,
  sendPassResetSuccessEmail,
} from "#/utils/mail";
import { OAuth2Client } from "google-auth-library";

export const createUser: RequestHandler = async (req, res) => {
  const { email, name, password } = req.body;
  const oldUser = await User.findOne({ email });
  if (oldUser)
    return res.status(400).json({ message: "User email already exist!" });
  const user = await User.create({ name, email, password });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
};

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(403).json({ message: "Email/Password Mismatch!" });
  // compare password
  const matched = await user.comparePassword(password);
  if (!matched)
    return res.status(403).json({ message: "Email/Password Mismatch!" });
  const token = jwt.sign(
    { userId: user._id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET, { expiresIn: '1d'}
  );
  user.token = token;
  await user.save();
  res.json({
    token,
  });
};

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Account not found!" });

  //  generate the link if the email exist
  await passwordResetToken.findOneAndDelete({
    user: user._id,
  });

  const token = crypto.randomBytes(36).toString("hex");

  await passwordResetToken.create({
    user: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgetPasswordLink({ email: user.email, link: resetLink });

  res.json({ message: "Check your registered mail" });
};

export const isValidPasswordReset: RequestHandler = async (req, res) => {
  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({ user: userId });
  if (!resetToken)
    return res
      .status(403)
      .json({ error: "Unauthorized acccess, invalid token" });

  const matched = await resetToken.compareToken(token);
  if (!matched)
    return res
      .status(403)
      .json({ error: "Unauthorized acccess, invalid token" });

  res.json({ message: "your token is valid." });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Unathorized access!" });

  const matched = await user.comparePassword(password);
  if (matched)
    return res
      .status(422)
      .json({ error: "The new password must be diffrent!" });

  user.password = password;
  await user.save();

  await passwordResetToken.findOneAndDelete({ user: user._id });
  // send success mail
  sendPassResetSuccessEmail(user?.name, user.email);
  res.json({ message: "Password Reset successfully." });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { address, phone, name } = req.body;
  const userId = req.user.id;
  const user = await User.findByIdAndUpdate(userId, { address, phone, name });
  if (!user) return res.status(403).json({ error: "Unauthorized request!" });
  res.json({ message: "Profile updated sucessfully!" });
};

export const getTotalUsers: RequestHandler = async (req, res) => {
  try {
    // Count the total number of users excluding those with the role of admin
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleSignUp: RequestHandler = async (req, res)=>{
  res.header('Acess-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');

  const redirectUrl = 'http://127.0.0.1:9090/oauth';

  const OAuthClient = new OAuth2Client(
    CLIENT_SECRET, CLIENT_ID, redirectUrl
  )

  const authorizeUrl = OAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
    prompt: 'consent'
  });
  res.json({url: authorizeUrl})
}


export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password -favourite -token'); 
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No non-admin users found' });
    }

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({
    profile: req.user,
  });
};