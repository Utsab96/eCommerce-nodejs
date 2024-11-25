const express=require('express');
const adminRouter=express.Router();
//exporting the database
const db=require('../shared/db_connect');
const base_url=require('../shared/base_url');
//const eCommerceRouter = require('./eCommerce.routes');
const checkToken=require('../middlewere/auth.middleware')
const multer=require('multer');

//creating multer storage
const myUploadStorage=multer.diskStorage({
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname);
    },
    destination:"./public/uploads"
});
//creating an object for upload storage

const uploadObj=multer({
    storage:myUploadStorage
});

//creating end point for all data==> GET
adminRouter.get("/all",checkToken,(req,res)=>{
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

adminRouter.post("/add",checkToken,uploadObj.single('avatar'),(req,res)=>{
    
    let name=req.body.name;
    let description=req.body.description;
    let price=req.body.price;
    let image_url=base_url+"/"+req.file.filename;
    stock_quantity=req.body.stock_quantity;

    let SQL=`INSERT INTO product(name,description,price,image_url,stock_quantity)
                VALUES('${name}','${description}','${price}','${image_url}','${stock_quantity}')`;
    db.query(SQL,(error,productInfo)=>{
        if(error){
            res.status(500).json(error)
        }
        else{
            if(productInfo.affectedRows==1){
                res.status(200).json({"message":"gadget added succesfully"})
            }
            else{
                res.status(200).json({"message":"gadget add failed"})
            }
            
        }
    })

});

adminRouter.put("/update/:gid",checkToken,uploadObj.single('avatar'),(req,res)=>{
    let updateId=req.params.gid;

    let name=req.body.name;
    let description=req.body.description;
    let price=req.body.price;
    let image_url=base_url+"/"+req.file.filename;
    let stock_quantity=req.body.stock_quantity;
    
    let SQL=`UPDATE product
                SET name='${name}',
                    description='${description}',
                    price='${price}',
                    image_url='${image_url}',
                    stock_quantity='${stock_quantity}'
                WHERE product_id='${updateId}'`;
    db.query(SQL,(error,productInfo)=>{
        if(error){
            res.status(500).json(error)
        }
        else{
            if(productInfo.affectedRows==1){
                res.status(200).json({"message":"gadget updated succesfully"})
            }
            else{
                res.status(200).json({"message":" gadget update failed"})
            }
            
        }
    })
})

adminRouter.delete("/delete/:gid",checkToken,(req,res)=>{
    let deleteId=req.params.gid;
    let SQL=`DELETE FROM product WHERE product_id='${deleteId}'`;

    db.query(SQL,(error,productInfo)=>{
        if(error){
            res.status(500).json(error)
        }
        else{
            if(productInfo.affectedRows==1){
                res.status(200).json({"message":"gaadget deleted succesfully"})
            }
            else{
                res.status(200).json({"message":"no gadget found"})
            }
            
        }
    });
})


module.exports=adminRouter;
console.log(`admin router is ready to use`);
