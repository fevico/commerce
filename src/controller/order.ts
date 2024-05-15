import { RequestHandler } from "express";
import Order from "#/model/order";
import User from "#/model/user";
import Shipping from "#/model/shipping";

// export const createOrder: RequestHandler = async (req, res) => {
//     const userId = req.user.id;
//     const {phone, address, productId, quantity} = req.body;
//     const  order = await Order.create({userId, phone, address, productId, quantity})
//     res.json({order})
// }


 export const getAllUserOrders: RequestHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId: userId });
        res.json({ orders });
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
      }
      

    // try {
    //     const orders = await Order.aggregate([
    //         { $match: { userId: userId } }, // Filter orders by userId
    //         {
    //             $lookup: {
    //                 from: 'products', // Name of the product collection
    //                 localField: 'orderId', // Field from the Order collection
    //                 foreignField: '_id', // Field from the Product collection
    //                 as: 'order' // Output array field containing the product details
    //             }
    //         },
    //         { $unwind: '$order' }, // Unwind the product array to get individual product details
    //         {
    //             $project: {
    //                 _id: 0, // Exclude _id field
    //                 orderId: '$_id', // Rename _id field to orderId
    //                 productName: '$order.name',
    //                 productPrice: '$product.price',
    //                 productImage: '$product.image',
    //                 productQty: '$quantity',
    //                 address: '$address', // Include address field from Order collection
    //                 phone: '$phone' // Include phone field from Order collection
    //                 // Add more fields as needed
    //             }
    //         }
    //     ]);

    //     if (!orders) {
    //         return res.status(404).json({ message: "No orders found for the user" });
    //     }

    //     res.json({ orders });
    // } catch (error) {
    //     res.status(500).json({ message: "An error occurred while fetching user orders" });
    // }
};

export const getOrderById: RequestHandler = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findOne({_id: userId});
    if(!user) res.status(403).json({error: "Unauthorized request!"})
    const orderId = req.params.orderId; // Access orderId directly from req.params
    const order = await Order.findOne({ userId: userId, _id: orderId }); 
    if (!order) return res.status(400).json({ message: "Cannot find order!" });

    try {
        const getOrder = await Order.aggregate([
            { $match: { _id: orderId } }, // Convert orderId to ObjectId
            {
                $lookup: {
                    from: 'products', // Name of the product collection
                    localField: 'productId', // Field from the Order collection
                    foreignField: '_id', // Field from the Product collection
                    as: 'product' // Output array field containing the product details
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 0, // Exclude _id field
                    orderId: '$_id', // Rename _id field to orderId
                    productName: '$product.name',
                    productPrice: '$product.price',
                    productImage: '$product.image',
                    productQty: '$quantity',
                    address: '$address', // Include address field from Order collection
                    phone: '$phone', // Include phone field from Order collection
                    status: '$status'
                }
            }
        ]); 

        if(!getOrder) return res.status(400).json({message: 'Something went wrong!'})
        
        res.json({ getOrder });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ message: "An error occurred while fetching order details" });
    }
};

export const confirmedOrderStatus: RequestHandler = async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Cannot find order document!" });

    const shipping = await Shipping.findOne({ orderId });
    if (!shipping) return res.status(400).json({ message: "Cannot find shipping document!" });

    if (order.orderStatus === "pending") {
        order.orderStatus = "shipped";
        shipping.status = 'shipped';
    } else if (order.orderStatus === 'shipped') {
        order.orderStatus = 'completed';
        shipping.status = 'completed';
    } else {
        return res.status(400).json({ message: "Order already completed!" });
    }

    // // Update shipping status directly based on order status
    // if (shipping.status === 'pending') {
    //     shipping.status = 'shipped';
    // } else if (shipping.status === 'shipped') {
    //     shipping.status = 'completed';
    // } else {
    //     return res.status(400).json({ message: "Order already shipped!" });
    // }

    await order.save();
    // await shipping.save();

    res.json({ message: "Order confirmed and shipped successfully!" }); 
};


export const totalNumberOfOrders: RequestHandler = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        res.json({ totalOrders });
    } catch (error) {
        console.error("Error fetching total number of orders:", error);
        res.status(500).json({ message: "An error occurred while fetching total number of orders" });
    }
}
 
export const totalNumberOfConfirmedOrders: RequestHandler = async (req, res) =>{
    const totalConfirmedOrders = await Order.countDocuments({orderStatus: "confirmed"})
    res.json({totalConfirmedOrders});
}

export const totalNumberOfShippedOrders: RequestHandler = async (req, res) =>{
    const numberOfShippedOrders = await Shipping.countDocuments({status: "shipped"});
    res.json({numberOfShippedOrders});
}

export const totalNumberOfPendingOrders: RequestHandler = async (req, res) =>{
    const userId = req.user.id;
    const user = await User.findOne({_id: userId});
    if(!user) return res.status(403).json({message: "Access denied!"});
    const numberOfPendingOrders = await Order.countDocuments({orderStatus: "pending"})
    res.json({numberOfPendingOrders});
}

export const totalNumberOfProcessingOrders: RequestHandler = async (req, res) => {
    const totalProcessing = await Order.countDocuments({orderStatus: "processing"});
    res.json({totalProcessing});
}

 export const getAllOrders: RequestHandler = async (req, res) =>{
    const allOrders = await Order.find().sort({createdAt: -1});
    if(!allOrders) return res.status(400).json({message: "No order fetch"})
    res.json({allOrders});
}

// export const confirmOrderByuser: RequestHandler = async (req, res) =>{
//     const userId = req.user.id
//     const orderId = req.params.order
//     const userOrder = await Order.find(userId)
//     if(!userOrder) return status(422).json({message: "No order record for this user!"});
//     const order = await Order.findById(orderId) 
//     if(order.status === "shipped"){
//         order.status = "completed"
//     }else{
//         return res.status(422).json({message: "Order still pending cannot confirm order!"})
//     }
//     order.save()
//     res.json({message: "user order confirmed succesfully!"})
// }