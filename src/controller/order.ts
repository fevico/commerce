import { RequestHandler } from "express";
import Order from "#/model/order";
import User from "#/model/user";
import Shipping from "#/model/shipping";
import { paymentConfirmationEmail, sendOrderConfirmationEmail } from "#/utils/mail";
import product from "#/model/product";
import { generateOrderNumber } from "#/utils/tokenHelper";

export const getAllUserOrders: RequestHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log(userId);

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

    const user = await User.findOne({ _id: userId });
    if (!user) res.status(403).json({ error: "Unauthorized request!" })
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
                    status: '$status',
                    orderNumber: '$orderNumber',
                    orderDate: '$orderDate',
                    note: '$note'
                    // Add more fields as needed

                }
            }
        ]);

        if (!getOrder) return res.status(400).json({ message: 'Something went wrong!' })

        res.json({ order });
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

export const totalNumberOfConfirmedOrders: RequestHandler = async (req, res) => {
    const totalConfirmedOrders = await Order.countDocuments({ orderStatus: "confirmed" })
    res.json({ totalConfirmedOrders });
}

export const totalNumberOfShippedOrders: RequestHandler = async (req, res) => {
    const numberOfShippedOrders = await Shipping.countDocuments({ status: "shipped" });
    res.json({ numberOfShippedOrders });
}

export const totalNumberOfPendingOrders: RequestHandler = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(403).json({ message: "Access denied!" });
    const numberOfPendingOrders = await Order.countDocuments({ orderStatus: "pending" })
    res.json({ numberOfPendingOrders });
}

export const totalNumberOfProcessingOrders: RequestHandler = async (req, res) => {
    const totalProcessing = await Order.countDocuments({ orderStatus: "processing" });
    res.json({ totalProcessing });
}

export const getAllOrders: RequestHandler = async (req, res) => {
    const allOrders = await Order.find().sort({ createdAt: -1 });
    if (!allOrders) return res.status(400).json({ message: "No order fetch" })
    res.json({ allOrders });
}

// export const createOrder: RequestHandler = async (req, res) => {
//     const userId = req.user.id;
//     const userName = req.user.name;
//     const userEmail = req.user.email;

//     try {
//         const { name, email, phone, address, cart: cartString, totalPrice, proofOfPayment } = req.body;

//         // Parse the stringified cart into a JavaScript object
//         const cart = JSON.parse(cartString);

//         // Validate the parsed cart
//         if (!cart || cart.length === 0) {
//             return res.status(400).json({ message: "Cart is empty!" });
//         }
//         const orderNumber = generateOrderNumber(10)
//        const orderDate = new Date().toISOString().slice(0, 10);
//         // Create a new order
//         const order = new Order({
//             userId,
//             name,
//             email,
//             mobile: phone,
//             address,
//             total: totalPrice,
//             cart,  // Save the parsed cart to the order
//             proofOfPayment,
//             orderStatus: "pending",
//             isPaid: false,
//             orderNumber,
//             orderDate
//         });

//         // Save the order to the database
//         await order.save();

//         // Create a shipping entry for the order
//         const shipping = new Shipping({
//             orderId: order._id,
//             name,
//             email,
//             address,
//             phone,
//         });
//         await shipping.save();

//         // Update product stock and top selling products
//         for (const cartItem of cart) {
//             const productId = cartItem.id;
//             const productExist = await product.findById(productId);

//             if (!productExist) {
//                 return res.status(422).json({ message: `Product with ID: ${productId} not found` });
//             }

//             // Decrease product quantity and update top selling field
//             const purchaseQuantity = parseInt(cartItem.quantity, 10); // Ensure quantity is a number
//             productExist.quantity -= purchaseQuantity;
//             productExist.topSelling = Math.max(productExist.topSelling, purchaseQuantity);

//             // Mark the product as out of stock if needed
//             if (productExist.quantity <= 0) {
//                 productExist.inStock = false;
//             }

//             // Save the updated product
//             await productExist.save();
//         }
//             const products = cart.map((item: any) => item.id);
//         // Send order confirmation email
//         await sendOrderConfirmationEmail(userName, userEmail, orderNumber, orderDate,  );

//         res.status(201).json({
//             message: "Order created successfully!",
//             orderId: order._id,
//             order,
//         });
//     } catch (error) {
//         console.error("Error creating order:", error);
//         res.status(500).json({ message: "Failed to create order" });
//     }
// };

export const createOrder: RequestHandler = async (req, res) => {
    const userId = req.user.id;
    const userName = req.user.name;
    const userEmail = req.user.email;

    try {
        const { name, email, phone, address, cart: cartString, totalPrice } = req.body;

        // Parse the stringified cart into a JavaScript object
        const cart = JSON.parse(cartString);
        // console.log(cart)
        // Validate the parsed cart
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty!" });
        }
        const orderNumber = generateOrderNumber(4);
        const orderDate = new Date().toISOString().slice(0, 10);

        // Create a new order
        const order = new Order({
            userId,
            name,
            email,
            mobile: phone,
            address,
            total: totalPrice,
            cart,  // Save the parsed cart to the order
            orderStatus: "pending",
            isPaid: "unpaid",
            orderNumber,
            orderDate
        });


        // Save the order to the database
        await order.save();



        // Prepare product names and quantities for the email
        let productList = '';
        for (const cartItem of cart) {
            const productId = cartItem.id;
            const productExist = await product.findById(productId);

            if (!productExist) {
                return res.status(422).json({ message: `Product with ID: ${productId} not found` });
            }

            // Decrease product quantity and update top selling field
            const purchaseQuantity = parseInt(cartItem.quantity, 10); // Ensure quantity is a number
            productExist.quantity -= purchaseQuantity;
            productExist.topSelling = Math.max(productExist.topSelling, purchaseQuantity);

            // Mark the product as out of stock if needed
            if (productExist.quantity <= 0) {
                productExist.inStock = false;
            }

            // Save the updated product
            await productExist.save();

            // Append product name and quantity to the list for the email
            productList += `Product: ${productExist.name}, Quantity: ${purchaseQuantity}\n`;
        }

        // Send order confirmation email
        await sendOrderConfirmationEmail(
            userName,
            userEmail,
            orderNumber,
            orderDate,
            productList,    // Send the product list
            totalPrice,     // Send the total amount
            cart.length     // Send the number of products in the order
        );

        res.status(201).json({
            message: "Order created successfully!",
            orderId: order._id,
            order,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
};


export const updateOrderToProcessing: RequestHandler = async (req, res) => {
    const orderId = req.params.orderId;

    try {
        const { name, email, address, phone, note, orderNumber } = req.body;

        // Find the order by ID and order number
        const order = await Order.findOne({ _id: orderId, orderNumber });
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        // Update the order to "Processing" and fill in the provided details
        order.isPaid = "processing";
        order.name = name;
        order.email = email;
        order.mobile = phone;
        order.address = address;
        order.note = note;

        await order.save();


        const shipping = new Shipping({
            orderId: order._id,
            name,
            email,
            address,
            phone,
            note,
        });
        await shipping.save();

        res.status(200).json({
            message: "Order updated to processing successfully!",
            order,
        });
    } catch (error) {
        console.error("Error updating order to processing:", error);
        res.status(500).json({ message: "Failed to update order to processing" });
    }
};




export const confirmedOrderPaymentStatus: RequestHandler = async (req, res) => {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Cannot find order document!" });


    if (order.isPaid === "processing") {
        order.isPaid = "paid";

    } else {
        return res.status(400).json({ message: "Order payment already confirmed!" });
    }

    await order.save();
    await paymentConfirmationEmail(order.name, order.email, order.orderNumber, order.orderDate, order.total);

    res.json({ message: "Order payment verified successfully!" });
};