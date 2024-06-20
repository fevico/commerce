import { RequestHandler } from "express";
import Product from "#/model/product";
import User from "#/model/user";
import { isValidObjectId } from "mongoose";


// export const getAllProducts: RequestHandler = async (req, res) => {
//   try {

//     const { search } = req.query;
//     const match: any = {};

//     if (search) {
//       match.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { 'categoryDetails.name': { $regex: search, $options: 'i' } },
//         { 'brandDetails.name': { $regex: search, $options: 'i' } }
//       ];
//     }
//     const products = await Product.find();

//     const result = await Product.aggregate([
//       {
//         $match: {
//           _id: { $in: products.map((p) => p._id) },
//         },
//       },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'categoryDetails',
//         },
//       },
//       { $unwind: '$categoryDetails' },
//       {
//         $lookup: {
//           from: 'brands',
//           localField: 'brand',
//           foreignField: '_id',
//           as: 'brandDetails',
//         },
//       },
//       { $unwind: '$brandDetails' },
//       {
//         $project: {
//           _id: "$_id",
//           name: "$name",
//           price: "$price",
//           image: "$image",
//           description: "description",
//           brandName: '$brandDetails.name',
//           categoryName: '$categoryDetails.name',
//         },
//       },
//     ]);

//     if (!result || result.length === 0) {
//       return res.status(400).json({ message: 'No products found!' });
//     }

//     res.json({ result });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const getAllProducts: RequestHandler = async (req, res) => {
  const { search } = req.query; // Get the search query from request parameters
  let query = {}; // Initialize the query object

  // If search query is provided and it's a string, construct the search criteria
  if (typeof search === "string") {
    const regex = new RegExp(search, "i"); // Case-insensitive regex pattern
    query = {
      $or: [
        { name: { $regex: regex } }, // Search by name
        { category: { $regex: regex } }, // Search by category
        { category: { $regex: regex } }, // Search by category
        { brand: { $regex: regex } }, // Search by brand
      ],
    };
  }

  const products = await Product.find();
  if (!products || products.length === 0) {
    return res.status(404).json({ error: "No products found!" });
  }

  const result = await Product.aggregate([
    // {
    //   $match: {
    //     _id: { $in: products.map((p) => p._id) },
    //   },
    // },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    { $unwind: "$categoryDetails" },

    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brandDetails",
      },
    },
    { $unwind: "$brandDetails" },
    {
      $replaceRoot: {
        newRoot: {
          _id: "$_id",
          name: "$name",
          description: "$description",
          category: "$categoryDetails.name",
          brand: "$brandDetails.name",
          price: "$price",
          image: "$image",
          status: "$status",
        },
      },
    },
  ]);

  const structuredResponse = {
    products: result.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      image: product.image,
      status: product.status,
    })),
  };

  res.status(200).json(structuredResponse);
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
    brandId,
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
    brandId
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

// export const topSelling: RequestHandler = async (req, res) =>{
//   const {productId} = req.body
//   const product = await Product.findById(productId)
//   if(!product) return res.status(422).json({message: "Cannot display product!"})
//     const order = await Order.cart.findOne({productId: id})
//   if(!order) return res.status(422).json({message: "Cannot display product!"})
//     if(order){
//       await product.quantity - order.cart.quantity
//     }
// }