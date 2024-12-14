import { RequestHandler } from "express";
import Product from "#/model/product";
import User from "#/model/user";
import { isValidObjectId } from "mongoose";
import { Parser } from "json2csv";
import mongoose from "mongoose";


interface ProductSearchResult {
  name: string;
  price: number;
  category: string | null;
  categoryId: string | null;
  image: string[];
  discount: number;
  inStock: boolean;
  _id: string;
  quantity: number;
  description: string;
}

interface categorySearchResult {
  name: string;
  _id: string;
}

export const getAllProducts: RequestHandler = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Parse query parameters as integers
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  // Validate inputs
  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters." }); 
  }

  try {
      // Calculate the number of documents to skip
      const skip = (pageNumber - 1) * limitNumber;

      // Query the database with pagination and population
      const products = await Product.find()
          .populate<{categoryId: categorySearchResult}>("categoryId")
          .skip(skip)
          .limit(limitNumber);

          const fetchedProduct = products.map<ProductSearchResult>((product) =>({
            name: product.name,
            price: product.price,
            category: product.categoryId?.name || null,
            categoryId: product.categoryId._id.toString() || null,
            image: product.image,
            discount: product.discount,
            inStock: product.quantity > 0,
            _id: product._id.toString(),
            quantity: product.quantity,
            description: product.description,

          }))
      // Get the total count of products
      const totalProducts = await Product.countDocuments();

      // Send the response
      return res.json({
         pagination:{
          currentPage: pageNumber,
          totalPages: Math.ceil(totalProducts / limitNumber),
          totalProducts,
         },
          products: fetchedProduct
      });
  } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "An error occurred while fetching products." });
  }
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

export const toggleProductStock: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.body;
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    // Toggle the `inStock` field
    product.inStock = !product.inStock;

    // Save the updated product
    await product.save();

    res.json({ message: "Product stock status updated!", product });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error });
  }
};

export const exportProductToCSV: RequestHandler = async (req, res) => {

  try {
    const products = await Product.find({}); // Fetch data from MongoDB

    // Prepare the data for CSV conversion
    const csvData = products.map((product) => ({
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      quantity: product.quantity,
    }));

    // Define CSV fields
    const csvFields = ["name", "price", "inStock", "quantity"];

    // Initialize the parser with fields
    const parser = new Parser({ fields: csvFields });
    const csvContent = parser.parse(csvData);

    // Set headers for the response
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");

    // Send the CSV content
    res.status(200).send(csvContent); 
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).json({ message: "An error occurred while generating the CSV file." });
  }
};

// const { page = 1, limit = 10 } = req.query;
// const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
// const products = await Product.find({ categoryId }).skip(skip).limit(parseInt(limit as string, 10));

// const { minPrice, maxPrice, brandId } = req.query;
// const query: any = { categoryId };
// if (minPrice) query.price = { $gte: parseFloat(minPrice as string) };
// if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice as string) };
// if (brandId) query.brandId = brandId;
// const products = await Product.find(query); 


// export const filterProductsByCategory: RequestHandler = async (req, res) => {
//     const { categoryId } = req.query;

//     // Validate categoryId
//     if (!categoryId || typeof categoryId !== "string") {
//         return res.status(400).json({ message: "Category ID is required and must be a string." });
//     }

//     try {
//         // Convert categoryId to ObjectId
//         const objectId = new mongoose.Types.ObjectId(categoryId);

//         // Fetch products filtered by categoryId
//         const products = await Product.find({ categoryId: objectId })
//             .populate<{ categoryId: { name: string } }>("categoryId");

//         // Transform the product data
//         const fetchedProduct = products.map(product => ({
//             name: product.name,
//             price: product.price,
//             category: product.categoryId?.name || null,
//             image: product.image,
//             discount: product.discount,
//             inStock: product.quantity > 0,
//         }));

//         return res.json({ fetchedProduct });
//     } catch (error) {
//         if (error instanceof mongoose.Error.CastError) {
//             return res.status(400).json({ message: "Invalid Category ID format." });
//         }
//         console.error("Error fetching products by category:", error);
//         return res.status(500).json({ message: "An error occurred while fetching products." });
//     }
// };

export const filterProductsByCategory: RequestHandler = async (req, res) => {
    const { categoryId } = req.query;

    // Validate that categoryId is provided and is a valid string
    if (!categoryId || typeof categoryId !== "string") {
        return res.status(400).json({ message: "Category ID is required and must be a string." });
    }

    try {
        // Convert categoryId to ObjectId
        const objectId = new mongoose.Types.ObjectId(categoryId);

        // Query products by categoryId
        const products = await Product.find({ categoryId: objectId })
            .populate<{ categoryId: { name: string } }>("categoryId") // Populate categoryId with its name
            .select("name price image discount quantity featured categoryId"); // Select specific fields to return

        // Map results to include the necessary fields
        const fetchedProduct = products.map(product => ({
            name: product.name,
            price: product.price,
            category: product.categoryId?.name || null, // Include category name
            image: product.image,
            discount: product.discount,
            inStock: product.quantity > 0, // Derive inStock status
            featured: product.featured,
        }));

        return res.json({ products: fetchedProduct });
    } catch (error) {
        console.error("Error filtering products by category:", error);

        // Handle invalid ObjectId format
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: "Invalid Category ID format." });
        }

        return res.status(500).json({ message: "An error occurred while fetching products." });
    }
};




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