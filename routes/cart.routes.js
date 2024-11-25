const express = require('express');
const cartRouter = express.Router();
const db = require('../shared/db_connect');
const checkToken=require('../middlewere/auth.middleware')

// Endpoint to add an item to the cart
cartRouter.post("/place/:uid/:pid",checkToken, (req, res) => {
    const user_id = req.params.uid; // User ID from URL
    const product_id = req.params.pid; // Product ID from URL
    const quantity = req.body.quantity || 1; // Default to 1 if quantity is not provided

    // Step 1: Check if the user's cart exists
    const getCartSQL = 'SELECT cart_id FROM Cart WHERE user_id = ?';

    db.query(getCartSQL, [user_id], (error, cartResults) => {
        if (error) {
            return res.status(500).json({ error: 'Error checking cart.' });
        }

        let cart_id;

        if (cartResults.length > 0) {
            // Cart exists, get the cart_id
            cart_id = cartResults[0].cart_id;
        } else {
            // No cart exists, create a new cart
            const createCartSQL = 'INSERT INTO Cart (user_id) VALUES (?)';
            db.query(createCartSQL, [user_id], (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Error creating cart.' });
                }
                cart_id = result.insertId; // Get the new cart_id

                // Now add the item to the CartItem table
                addItemToCart();
            });
        }

        // Function to add the item to the CartItem table
        const addItemToCart = () => {
            const addItemSQL = 'INSERT INTO CartItem (cart_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(addItemSQL, [cart_id, product_id, quantity], (error, cartInfo) => {
                if (error) {
                    return res.status(500).json({ error: 'Error adding item to cart.' });
                }
                if (cartInfo.affectedRows === 1) {
                    res.status(200).json({ message: "Item added to cart successfully.", cart_id });
                } else {
                    res.status(400).json({ message: "Failed to add item to cart." });
                }
            });
        };

        // If cart already exists, just add the item
        if (cart_id) {
            addItemToCart();
        }
    });
});


cartRouter.get("/:uid",checkToken, (req, res) => {
    const user_id = req.params.uid; // Get user ID from URL

    // Step 1: Get the user's cart
    const getCartSQL=`SELECT c.cart_id, ci.item_id, ci.product_id, ci.quantity, p.name AS product_name
                        FROM Cart c
                        LEFT JOIN CartItem ci ON c.cart_id = ci.cart_id
                        LEFT JOIN Product p ON ci.product_id = p.product_id
                        WHERE c.user_id = ?;
                        `;

    db.query(getCartSQL, [user_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error retrieving cart.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No cart found for this user." });
        }

        // Organize the cart data
        const cart = {
            cart_id: results[0].cart_id,
            items: results.map(item => ({
                item_id: item.item_id,
                product_id: item.product_id,
                product_name:item.product_name,
                quantity: item.quantity
            }))
        };

        res.status(200).json(cart); // Return the cart data
    });
});



cartRouter.delete("/delete/:uid/:itemId", checkToken,(req, res) => {
    const user_id = req.params.uid; // Get user ID from URL
    const item_id = req.params.itemId; // Get item ID from URL

    // Step 1: Check if the item belongs to the user's cart
    const checkItemSQL = `SELECT ci.item_id 
                          FROM Cart c
                          JOIN CartItem ci ON c.cart_id = ci.cart_id
                          WHERE c.user_id = ? AND ci.item_id = ?`;

    db.query(checkItemSQL, [user_id, item_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error checking item in cart.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Item not found in this user's cart." });
        }

        // Step 2: Delete the item from the CartItem table
        const deleteItemSQL = `DELETE FROM CartItem WHERE item_id = ?`;

        db.query(deleteItemSQL, [item_id], (deleteError, deleteResult) => {
            if (deleteError) {
                return res.status(500).json({ error: 'Error removing item from cart.' });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: "Failed to remove item from cart." });
            }

            res.status(200).json({ message: "Item removed from cart successfully." });
        });
    });
});

module.exports = cartRouter;
console.log(`Cart router is ready to use`);
