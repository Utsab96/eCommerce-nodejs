const jwt = require('jsonwebtoken');
const env = require('dotenv').config();

function checkToken(req, res, next) {
    const token = req.headers.token; // Make sure your header name matches

    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }

    jwt.verify(token, process.env.PRIVATE_KEY, (error, decoded) => {
        if (error) {
            return res.status(401).json({ "token error": error.message }); // Use status 401 for unauthorized
        } else {
            console.log(decoded);
            req.userId = decoded.user_id; // Save user_id from the token to req for later use
            next(); // Call the next middleware or route handler
        }
    });
}

module.exports = checkToken;

console.log(`Check token middleware is ready to use`);
