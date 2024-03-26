// @ts-nocheck
import Order from "#/model/order";
import Shipping from "#/model/shipping";
import Router, { response } from "express";

const router = Router();
const https = require("https");

router.post("/payment", function (req, res) {
  const { amount, email, metadata } = req.body;

  const params = JSON.stringify({
    email,
    amount,
    callback_url: "https://ekomas-react-new.vercel.app/",
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

router.get("/verify", async function (req, res) { // Corrected function async syntax
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
        console.log(responseData); // Log the response for debugging purposes

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
            totalPrice: paymentData.totalPrice,
            cart: paymentData.cart,
            transactionId: paymentData.transactionId, // Corrected property name
            status
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

          res.send(data);
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
