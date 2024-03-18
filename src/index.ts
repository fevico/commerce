import express from 'express';
import 'dotenv/config'
import './db'
import cors from 'cors'
import categoryRouter from './routers/category'
import productRouter from './routers/product'
import authRouter from './routers/auth'
import orderRouter from './routers/order'

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

const PORT = 5004;

app.listen(PORT, ()=>{
    console.log('Port is listening on '+ PORT);
})