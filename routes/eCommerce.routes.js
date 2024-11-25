const express=require('express');
const eCommerceRouter=express.Router();
//exporting the database
const db=require('../shared/db_connect');
const checkToken=require('../middlewere/auth.middleware')
//creating end point for all data==> GET
eCommerceRouter.get("/all",(req,res)=>{
    let SQL=`SELECT * FROM product`

    db.query(SQL,(error,productInfo)=>{
        if(error){
            res.status(500).json(error)
        }
        else{
            res.status(200).json(productInfo)
        }
    })
    
})

module.exports=eCommerceRouter;
console.log(`ecommerce router is ready to use`);
