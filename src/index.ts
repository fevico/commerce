import express from 'express';
import 'dotenv/config'
import './db'
import categoryRouter from './routers/category'
import productRouter from './routers/product'
import authRouter from './routers/auth'
import cors from 'cors'

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

const PORT = 5004;

app.listen(PORT, ()=>{
    console.log('Port is listening on '+ PORT);
})