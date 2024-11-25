// Required modules
const express = require('express');
const userRouter = express.Router();
const db = require('../shared/db_connect');
const bcryptjs = require('bcryptjs');
//requring the jsonwebtoken
const jwt=require('jsonwebtoken');
const env=require('dotenv').config();

// Function to hash passwords
function hashedPassword(password) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(password, salt);
}

// Function to check passwords
function checkPassword(password, hashedPass) {
    return bcryptjs.compareSync(password, hashedPass);
}

// Sign up API for regular users
userRouter.post("/signup", (req, res) => {
    const { email, password } = req.body;
    const hashedPass = hashedPassword(password);

    const SQL = `INSERT INTO user (email, password_hash, role) VALUES (?, ?, 'user')`; // Default role is 'user'
    db.query(SQL, [email, hashedPass], (error, userInfo) => {
        if (error) {
            return res.status(500).json(error);
        }
        return res.status(200).json({"message": "Signup successful", "userInfo": userInfo});
    });
});

// Sign in API for regular users
userRouter.post("/signin", (req, res) => {
    const email = req.body.email;

    const SQL = `SELECT * FROM user WHERE email = ? AND role = 'user'`; // Ensure user role
    db.query(SQL, [email], (error, userInfo) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (userInfo.length === 0) {
            return res.status(200).json({"message": "User does not exist or is not a regular user"});
        }

        const db_hashed_pass = userInfo[0].password_hash;
        if (checkPassword(req.body.password, db_hashed_pass)) {
            let secretKey=process.env.PRIVATE_KEY;
            //generating the token
            let token=jwt.sign({"user_id":userInfo[0].user_id},secretKey,{expiresIn:'1h'})
            return  res.status(200).json({"message":"sign_in_success","logedInfo":userInfo,"token":token});
        } else {
            return res.status(200).json({"message": "Sign in failed"});
        }
    });
});

// Admin sign-in endpoint
userRouter.post("/admin/signin", (req, res) => {
    const email = req.body.email;

    const SQL = `SELECT * FROM user WHERE email = ? AND role = 'admin'`; // Ensure admin role
    db.query(SQL, [email], (error, userInfo) => {
        if (error) {
            return res.status(500).json(error);
        }
        if (userInfo.length === 0) {
            return res.status(200).json({"message": "Admin does not exist"});
        }

        const db_hashed_pass = userInfo[0].password_hash;
        if (checkPassword(req.body.password, db_hashed_pass)) {
            return res.status(200).json({"message": "Admin login successful", "userInfo": userInfo});
        } else {
            return res.status(200).json({"message": "Admin sign in failed"});
        }
    });
});

// Function to create an admin user (optional, for initial setup)
function createAdmin() {
    const adminEmail = "utsab.ghosh96@gmail.com"; // Replace with your desired admin email
    const adminPassword = "U@123"; // Replace with your desired admin password
    const hashedPass = hashedPassword(adminPassword);

    const SQL = `INSERT INTO user (email, password_hash, role) VALUES (?, ?, 'admin')`; // Create admin user
    db.query(SQL, [adminEmail, hashedPass], (error) => {
        if (error) {
            console.error("Error creating admin user:", error);
        } else {
            console.log("Admin user created successfully.");
        }
    });
}

// Uncomment to create the admin user once
//createAdmin();

// Exporting the user router
module.exports = userRouter;
console.log(`The user router is ready to use`);
