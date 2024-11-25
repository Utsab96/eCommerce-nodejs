//requring the express
const express=require('express');
//requiring the cors
const cors=require('cors');

//requiring the env file
const env=require('dotenv').config();
//requring the port and host
const port=process.env.PORT;
const host=process.env.HOST;

//importing the eCommerceRouter
const eCommerceRouter = require('./routes/eCommerce.routes');
const adminRouter = require('./routes/admin.routes');
const userRouter = require('./routes/users.routes');
const cartRouter = require('./routes/cart.routes');
//importing the user router

//creating instance for the express
const app=express();
app.use(cors());
//creating middleware to send json data from frontend
app.use(express.urlencoded({extended:true}));
app.use(express.json());
//here need to add the public folder of the uploaded folder to access the uploaded image
app.use(express.static("public"));
//creating home page
app.get("/",(req,res)=>{
    res.send(`<h1>Welcome to the Ecommerce</h1>`)
});

//adding the user router
app.use("/api/eCommerce",eCommerceRouter);

//adding the admin router
app.use("/api/admin",adminRouter);
app.use("/api/users",userRouter);
app.use("/api/cart",cartRouter);
app.listen(port,host,()=>{
    console.log(`The server is listening at http://${host}:${port}/`)
});
// app.listen(3000, '0.0.0.0', () => {
//     console.log('Server is listening on http://0.0.0.0:3000/');
// });
