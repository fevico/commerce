import { RequestHandler } from "express";
import Product from "#/model/product";

interface ProductSearchResult {
    name: string;
    price: number;
    category: string | null;
    image: string[];
    discount: number;
    inStock: boolean;
}

interface categorySearchResult {
    name: string;
}
export const searchProducts: RequestHandler = async (req, res) => {
    try {
        const { title, page = "1", limit = "20" } = req.query;

        // Validate title query parameter
        if (typeof title !== "string" || title.trim().length < 3) {
            return res.status(422).json({ message: "Invalid search query" });
        }

        // Parse and validate pagination parameters
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);

        if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
            return res.status(422).json({ message: "Invalid pagination parameters" });
        }

        const skip = (pageNumber - 1) * limitNumber;

        // Search the database with pagination and populate specific fields
        const [results, totalCount] = await Promise.all([
            Product.find({ name: { $regex: title, $options: "i" } })
                .populate<{categoryId: categorySearchResult}>({ path: "categoryId", select: "name" })
                .skip(skip)
                .limit(limitNumber),
            Product.countDocuments({ name: { $regex: title, $options: "i" } }),
        ]);

        // Transform results to include only required fields
        const products = results.map<ProductSearchResult>(product => ({
            name: product.name,
            price: product.price,
            category: product.categoryId?.name || null,
            image: product.image,
            discount: product.discount,
            inStock: product.inStock,
            featured: product.featured,
        }));

        // Return results with pagination metadata
        return res.json({
            pagination: {
                totalResults: totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                pageSize: limitNumber,
            },
            products,
        });
    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ message: "An error occurred while searching for products." });
    }
};
