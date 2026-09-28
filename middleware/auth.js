const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token, authorization denied',
            errorCode: 'NO_TOKEN'
        });
    }

    try {
        // Verify token (Bearer token format)
        const tokenPart = token.split(' ')[1] || token;
        const decoded = jwt.verify(tokenPart, process.env.JWT_SECRET);

        // Set user id in req
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
            errorCode: 'INVALID_TOKEN'
        });
    }
};
