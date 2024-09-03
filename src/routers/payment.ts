// @ts-nocheck
import Order from "#/model/order";
import Product from "#/model/product";
import Shipping from "#/model/shipping";
import { productOrderMail } from "#/utils/mail";
import Router, { response } from "express";

const router = Router();
const https = require("https");

router.post("/payment", function (req, res) {
  const { amount, email, metadata } = req.body;

  const params = JSON.stringify({
    email,
    amount,
    // callback_url: "https://yoamart.com/",
    callback_url: "http://localhost:5173/",

    metadata,
  });

  // console.log(params);

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const reqPaystack = https
    .request(options, (respaystack) => {
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", () => {
        res.send(data);
        console.log(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });

  reqPaystack.write(params);
  reqPaystack.end();
});

router.post("/verify", async function (req, res) { // Corrected function async syntax
  const reference = req.query.reference;
  // console.log(reference);
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  const reqPaystack = https
    .request(options, async (respaystack) => { // Mark the callback function as async
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", async () => { // Mark the callback function as async
        const responseData = JSON.parse(data);
        // console.log(responseData); // Log the response for debugging purposes

        // Check if payment was successful
        if (
          responseData.status === true &&
          responseData.data.status === "success"
        ) {
          // Payment was successful, extract relevant information
          const { customer, id, reference, status, currency, metadata } = responseData.data;

          const paymentData = {
            referenceId: reference,
            email: customer.email,
            status,
            currency,
            name: metadata.customerName,
            transactionId: id,
            phone: metadata.phone,
            address: metadata.deliveryAddress,
            totalPrice: metadata.totalPrice,
            cart: metadata.cart,
            userId: metadata.customerId
          };

          console.log(paymentData);

          // Correct the property name from "refrenceId" to "referenceId" in the Order instantiation
          const order = new Order({
            referenceId: reference, // Corrected property name
            email: paymentData.email,
            name: paymentData.name,
            userId: paymentData.userId,
            currency,
            mobile: paymentData.phone,
            address: paymentData.address,
            total: paymentData.totalPrice,
            cart: paymentData.cart,
            transactionId: paymentData.transactionId,
            status,
          });

          await order.save();

          const shipping = new Shipping({
            orderId: order._id,
            name: paymentData.name,
            email: paymentData.email,
            address: paymentData.address,
            phone: paymentData.phone
          });

          await shipping.save();

          const productList = paymentData.cart.map(item => {
            return `Product: ${item.name}, Price: ${item.totalPrice} Quantity: ${item.quantity}`;
          })

          const aggregatedProducts = {};
          paymentData.cart.forEach(product => {
            const productName = product.name;
            if (aggregatedProducts[productName]) {
              aggregatedProducts[productName].quantity += product.quantity;
              aggregatedProducts[productName].totalPrice += product.totalPrice;
            } else {
              aggregatedProducts[productName] = {
                quantity: product.quantity,
                totalPrice: product.totalPrice
              };
            }
          });

          // Send email for each product with aggregated data
          Object.keys(aggregatedProducts).forEach(productName => {
            const product = aggregatedProducts[productName];
            productOrderMail(
              paymentData.name,
              paymentData.email,
              productName,
              product.quantity,
              product.price,
              paymentData.address,
              paymentData.transactionId
            );
          });


          // productOrderMail({name: paymentData.name, email: paymentData.email, product: metadata.cart.name, quantity: metadata.cart.quantity,
          // image:metadata.cart.image, price: paymentData.totalPrice, address: paymentData.address, transactionId: paymentData.transactionId })

          // Find the product based on some criteria (e.g., product ID)
          const cart = metadata.cart;

          for (const cartItem of cart) {
            const productId = cartItem.id;
            const product = await Product.findById(productId);

            if (!product) {
              return res.status(422).json({ message: `Cannot display product with ID: ${productId}!` });
            } else {
              // Update the quantity of the product
              const purchaseQuantity = parseInt(cartItem.quantity, 10); // Ensure quantity is a number
              product.quantity -= purchaseQuantity;

              // Update the top selling field of the product
              product.topSelling = Math.max(product.topSelling, purchaseQuantity);

              // Update the inStock status
              if (product.quantity <= 0) {
                product.inStock = false;
              }

              // Save the updated product instance
              await product.save();
            }
          }

          // After iterating through all products, you can return a success response
          res.status(200).json({
            message: "Cart processed successfully!",
            paymentData: paymentData,
          });
        }

        // console.log(JSON.parse(data));
      });
    })
    .on("error", (error) => {
      console.error(error);
    });
  reqPaystack.end();
});


export default router;
