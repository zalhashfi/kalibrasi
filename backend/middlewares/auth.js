//import jwt
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    //get token from authorization header
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({
        success: false,
        message: 'Unauthenticated.',
    });

    //verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken;
