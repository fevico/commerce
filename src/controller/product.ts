import { RequestHandler } from "express";
import Product from "#/model/product";
import User from "#/model/user";
import { isValidObjectId } from "mongoose";

export const getAllproduct: RequestHandler = async (req, res) => {
  const products = await Product.find();
  if (!products)
    return res.status(400).json({ message: "Something went wrong!" });
  res.json({ products });
};

export const getProductById: RequestHandler = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product)
    return res.status(400).json({ message: "Something went wrong!" });
  res.json({ product });
};

export const createProduct: RequestHandler = async (req, res) => {
  // const user = req.user.id;
  // const findUser =await User.findById(user)
  // if(!findUser) return res.status(400).json({error: "Cannot create product"});
  const {
    name,
    description,
    price,
    image,
    categoryId,
    quantity,
    featured,
    discount,
  } = req.body;
  const product = new Product({
    name,
    description,
    price,
    image,
    categoryId,
    quantity,
    featured,
    discount,
  });
  await product.save();
  res.json({ product });
};

export const updateProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    description,
    price,
    image,
    categoryId,
    quantity,
    featured,
    discount,
  } = req.body;
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
  });
  if (!product) return res.status(400).json({ message: "product not found!" });
  res.json({ product });
};

export const deleteproduct: RequestHandler = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findByIdAndDelete(productId);
  if (!product)
    return res.status(400).json({ message: "Something went wrong!" });
  res.json({ message: true });
};

export const addToFavourite: RequestHandler = async (req, res) => {
  const { favourites } = req.body; // Assuming the frontend sends an array of favourite IDs

  // Validate if favourites is an array
  if (!Array.isArray(favourites)) {
    return res
      .status(400)
      .json({ message: "Invalid format for favourites. Expecting an array." });
  }

  // Validate each ID in the array
  for (const favourite of favourites) {
    if (!isValidObjectId(favourite)) {
      return res
        .status(400)
        .json({ message: `Invalid product id: ${favourite}` });
    }
  }

  const userId = req.user.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's favourites list with the new array of IDs
    user.favourite = favourites;
    await user.save();

    // Fetch updated user favourites
    const updatedUser = await User.findById(userId).populate("favourite");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ favorites: updatedUser.favourite });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  //   console.log(req.headers);

  try {
    // Find the user by userId and populate the 'favourite' field with product details
    const user = await User.findById(userId).populate("favourite");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ favorites: user.favourite });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user favorites" });
  }
};

export const deleteUserFavourite: RequestHandler = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Set the favourite array to an empty array
    user.favourite = [];
    
    // Save the user document to update the database
    await user.save();

    res.status(200).json({ message: "User favourites deleted successfully" });
}

export const totalNumberOfProducts: RequestHandler = async (req, res) =>{
  const totalProducts = await Product.countDocuments();
  res.json({totalProducts})
}