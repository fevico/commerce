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
  const { favourite } = req.body;
  const userId = req.user.id;

  if (!isValidObjectId(favourite)) {
    return res.status(400).json({ message: "Invalid product id!" });
  }

  // Check if the product exists
  const product = await Product.findById(favourite);
  if (!product) {
    return res
      .status(400)
      .json({ message: "Product not found! Cannot add to favorites." });
  }

  // Check if the product is already in the user's favorites list
  const user = await User.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found! Cannot add product to favorites." });
  }

  const alreadyInFavorites = user.favourite.includes(favourite);
  if (alreadyInFavorites) {
    return res
      .status(400)
      .json({ message: "Product is already in favorites." });
  }

  // Update the user's favorites list
  user.favourite.push(favourite);
  await user.save();

  // Fetch updated user favorites
  const updatedUser = await User.findById(userId).populate("favourite");

  res.json({ favorites: updatedUser.favourite });
};

export const removeFromFavourite: RequestHandler = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id!" });
  }

  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res
      .status(400)
      .json({ message: "Product not found! Cannot remove from favorites." });
  }

  // Update the user's favorites list
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favourite: productId } },
    { new: true }
  );
  if (!user) {
    return res
      .status(404)
      .json({
        message: "User not found! Cannot remove product from favorites.",
      });
  }

  // Fetch updated user favorites
  const updatedUser = await User.findById(userId).populate("favourite");

  res.json({ favorites: updatedUser.favourite });
};
// export const toggleFavourite: RequestHandler = async (req, res) => {
//     const { productId } = req.body;
//     const userId = req.user.id;
  
//     if (!isValidObjectId(productId)) {
//       return res.status(400).json({ message: "Invalid product id!" });
//     }
  
//     try {
//       let updatedFavorites;
  
//       // Check if the product exists in the user's favorites list
//       const user = await User.findById(userId);
//       if (!user) {
//         return res
//           .status(404)
//           .json({ message: "User not found! Cannot update favorites." });
//       }
  
//       const index = user.favourite.indexOf(productId);
//       if (index !== -1) {
//         // Product exists in favorites, remove it
//         user.favourite.splice(index, 1);
//         await user.save();
//         updatedFavorites = user.favourite;
//       } else {
//         // Product doesn't exist in favorites, add it
//         user.favourite.push(productId);
//         await user.save();
//         updatedFavorites = user.favourite;
//       }
  
//       // Fetch updated user favorites
//       const updatedUser = await User.findById(userId).populate("favourite");
  
//       res.json({ favorites: updatedUser.favourite });
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//       res.status(500).json({ message: "An error occurred while toggling favorite" });
//     }
//   };
  
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
