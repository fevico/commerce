import express from 'express';
import 'dotenv/config'
import './db'
import cors from 'cors'
import "express-async-errors"
import categoryRouter from './routers/category'
import productRouter from './routers/product'
import authRouter from './routers/auth'
import orderRouter from './routers/order'
import blogRouter from './routers/blog'
import paymentRouter from './routers/payment';
import brandRouter from './routers/brand';

const app = express();

app.use(
    cors({
      origin: "*",
      credentials: false,
    })
  );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/auth', authRouter);
app.use('/order', orderRouter);
app.use('/payment', paymentRouter);
app.use('/blog', blogRouter);
app.use('/brand', brandRouter)

app.use(function (err, req, res, next){
  res.status(500).json({message: err.message})
} as express.ErrorRequestHandler)

const PORT = 5004;

app.listen(PORT, '0.0.0.0', ()=>{
    console.log('Port is listening on '+ PORT);
})